import { callOpenRouter, AI_MODELS, extractJSON } from '@/lib/ai/inventory-client';

export interface ParsedInvoiceLine {
  distributorSku: string | null;
  description: string;
  cases: number;
  unitsPerCase: number;
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
      "unitsPerCase": number              // bottles/cans per case. Infer from pack size (e.g. "12/750ML" -> 12, "24/12OZ" -> 24). Default to 1 if not inferable.
    }
  ]
}

Rules:
- One object per physical line on the invoice. Do NOT aggregate.
- "cases" is the quantity column. If only singles are listed, set cases = quantity and unitsPerCase = 1.
- Ignore totals, subtotals, tax, fees, freight, deposit lines.
- For pack notation like "12/750", "24/12OZ", "6/4/12OZ": unitsPerCase is the FIRST number (12, 24, 24 respectively — the total individual containers per case).
- If the photo is blurry or you cannot read a field, use null.`;

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

  const raw = response.choices[0]?.message?.content ?? '';
  const parsed = extractJSON<ParsedInvoice>(raw);
  if (!parsed || !Array.isArray(parsed.lines)) {
    throw new Error('Failed to parse invoice — model did not return valid JSON lines');
  }

  return {
    distributorName: parsed.distributorName ?? null,
    invoiceNumber: parsed.invoiceNumber ?? null,
    invoiceDate: parsed.invoiceDate ?? null,
    lines: parsed.lines.map((line) => ({
      distributorSku: line.distributorSku ?? null,
      description: String(line.description ?? '').trim(),
      cases: Math.max(0, Math.floor(Number(line.cases) || 0)),
      unitsPerCase: Math.max(1, Math.floor(Number(line.unitsPerCase) || 1)),
    })).filter((line) => line.description.length > 0),
  };
}
