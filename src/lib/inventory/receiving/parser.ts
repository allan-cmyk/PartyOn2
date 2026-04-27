import { callOpenRouter, AI_MODELS, extractJSON } from '@/lib/ai/inventory-client';

export interface ParsedInvoiceLine {
  distributorSku: string | null;
  description: string;
  cases: number;
  unitsPerCase: number;
  /**
   * Case cost in dollars — the price the distributor charges per case for this line,
   * as printed on the invoice. Null if not legible. The applyInvoice flow translates
   * this into ProductVariant.costPerUnit using the matched variant's selling unit
   * (case for multi-packs, bottle for single-bottle variants like wine and liquor).
   *
   * The DB column is still named `unitCost` for legacy reasons; this field maps to it.
   */
  caseCost: number | null;
}

export interface ParsedInvoice {
  distributorName: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null; // ISO yyyy-mm-dd or null
  lines: ParsedInvoiceLine[];
}

const SYSTEM_PROMPT = `You are an expert at reading distributor invoices for a liquor/alcohol delivery business. You will be shown a photo of a printed invoice. Extract every line item.

Return ONLY JSON matching this shape, no prose:
{
  "distributorName": string | null,  // e.g. "Southern Glazer's", "RNDC"
  "invoiceNumber": string | null,
  "invoiceDate": string | null,      // ISO yyyy-mm-dd if visible
  "lines": [
    {
      "distributorSku": string | null,   // SKU / item code column
      "description": string,              // full product description as printed
      "cases": number,                    // number of cases ordered (integer)
      "unitsPerCase": number,             // bottles/cans per case. Infer from pack size (e.g. "12/750ML" -> 12, "24/12OZ" -> 24). Default to 1 if not inferable.
      "caseCost": number | null           // PER-CASE price in dollars. See cost rules below.
    }
  ]
}

Rules:
- One object per physical line on the invoice. Do NOT aggregate.
- "cases" is the quantity column. If only singles are listed, set cases = quantity and unitsPerCase = 1.
- Ignore totals, subtotals, tax, fees, freight, deposit lines.
- For pack notation like "12/750", "24/12OZ", "6/4/12OZ": unitsPerCase is the FIRST number (12, 24, 24 respectively — the total individual containers per case).
- If the photo is blurry or you cannot read a field, use null.

Cost rules:
- We only care about the CASE PRICE — the price for one full case as the distributor sells it.
- "caseCost" = price per case as printed on the invoice. This is the dollar figure in the price column for the row, NOT a per-bottle/per-can price.
- If the invoice ONLY shows a per-bottle/per-can unit price for a multi-bottle case, multiply it by unitsPerCase to get caseCost (e.g. 12 bottles × $15/bottle = $180 caseCost).
- Do NOT use line-extension totals (cases × case price). Use the per-case price.
- Exclude any deposit, freight, tax, fee, or discount adjustments — these are not COGS.
- If no case-level cost is legible, set caseCost to null. Do NOT guess.`;

export async function parseInvoiceImage(imageUrl: string): Promise<ParsedInvoice> {
  const response = await callOpenRouter(
    AI_MODELS.vision,
    [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Parse this distributor invoice. Return JSON only.' },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    { temperature: 0.1, maxTokens: 4000 }
  );

  // Tolerate older response shapes (`unitCost`) so partial reocr / cached responses don't break.
  interface RawLine {
    distributorSku?: string | null;
    description?: string;
    cases?: number;
    unitsPerCase?: number;
    caseCost?: number | null;
    unitCost?: number | null; // legacy / fallback per-bottle field
  }
  interface RawInvoice {
    distributorName?: string | null;
    invoiceNumber?: string | null;
    invoiceDate?: string | null;
    lines?: RawLine[];
  }

  const raw = response.choices[0]?.message?.content ?? '';
  const parsed = extractJSON<RawInvoice>(raw);
  if (!parsed || !Array.isArray(parsed.lines)) {
    throw new Error('Failed to parse invoice — model did not return valid JSON lines');
  }

  return {
    distributorName: parsed.distributorName ?? null,
    invoiceNumber: parsed.invoiceNumber ?? null,
    invoiceDate: parsed.invoiceDate ?? null,
    lines: parsed.lines.map((line) => {
      const cases = Math.max(0, Math.floor(Number(line.cases) || 0));
      const unitsPerCase = Math.max(1, Math.floor(Number(line.unitsPerCase) || 1));
      let caseCost: number | null = null;
      if (typeof line.caseCost === 'number' && isFinite(line.caseCost) && line.caseCost > 0) {
        caseCost = Number(line.caseCost.toFixed(4));
      } else if (typeof line.unitCost === 'number' && isFinite(line.unitCost) && line.unitCost > 0) {
        // Legacy per-bottle path — promote to case cost.
        caseCost = Number((line.unitCost * unitsPerCase).toFixed(4));
      }
      return {
        distributorSku: line.distributorSku ?? null,
        description: String(line.description ?? '').trim(),
        cases,
        unitsPerCase,
        caseCost,
      };
    }).filter((line) => line.description.length > 0),
  };
}
