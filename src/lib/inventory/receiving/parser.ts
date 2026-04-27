import { callOpenRouter, AI_MODELS, extractJSON } from '@/lib/ai/inventory-client';

export interface ParsedInvoiceLine {
  distributorSku: string | null;
  description: string;
  cases: number;
  unitsPerCase: number;
  /** Per-unit COGS extracted from the invoice. Null if not present/legible. */
  unitCost: number | null;
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
      "unitCost": number | null,          // per-unit cost in dollars. See cost rules below.
      "caseCost": number | null           // per-case cost in dollars. See cost rules below.
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
- Distributor invoices typically show one or more of: case price, unit/bottle price, line extension (cases × case price). Capture whichever the invoice shows directly.
- "unitCost" = price per single bottle/can/container (NOT per case). If the invoice prints both a case price and a unit price, use the unit price.
- "caseCost" = price per case. If only one cost is visible per line, populate the matching field and leave the other null — we'll derive the other side downstream.
- Do NOT divide line totals or extensions. Only capture costs that are printed per-line as case price or unit price.
- Exclude any deposit, freight, tax, fee, or discount adjustments — these are not COGS.
- If no cost is legible, set both unitCost and caseCost to null. Do NOT guess.`;

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

  // The model may return either unitCost, caseCost, both, or neither — declare a loose
  // shape here so the type checker doesn't reject the optional caseCost we look for below.
  interface RawLine {
    distributorSku?: string | null;
    description?: string;
    cases?: number;
    unitsPerCase?: number;
    unitCost?: number | null;
    caseCost?: number | null;
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
      // Prefer printed unitCost; otherwise derive from caseCost / unitsPerCase.
      let unitCost: number | null = null;
      if (typeof line.unitCost === 'number' && isFinite(line.unitCost) && line.unitCost > 0) {
        unitCost = Number(line.unitCost.toFixed(4));
      } else if (typeof line.caseCost === 'number' && isFinite(line.caseCost) && line.caseCost > 0 && unitsPerCase > 0) {
        unitCost = Number((line.caseCost / unitsPerCase).toFixed(4));
      }
      return {
        distributorSku: line.distributorSku ?? null,
        description: String(line.description ?? '').trim(),
        cases,
        unitsPerCase,
        unitCost,
      };
    }).filter((line) => line.description.length > 0),
  };
}
