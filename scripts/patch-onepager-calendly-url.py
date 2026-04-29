#!/usr/bin/env python3
"""
Patch public/email-assets/pod-partner-onepager.pdf — replace the
'YOUR-CALENDLY-LINK.com' placeholder on both pages with the real
partnership URL via a navy-rectangle overlay + new yellow text.

Run after re-exporting the PDF from the design source if the placeholder
string returns. The original text remains in the PDF text layer (overlay
only), but is visually hidden under the navy rectangle.

Usage:
  pip3 install --user pypdf reportlab
  python3 scripts/patch-onepager-calendly-url.py
"""
from io import BytesIO
from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

PDF_PATH = 'public/email-assets/pod-partner-onepager.pdf'
NEW_URL = '123.partyondelivery.com/partnership-call'

# Page geometry — letter (612 x 792 pts).
PAGE_H = 792

# Bounding box of the placeholder text "YOUR-CALENDLY-LINK.com" extracted
# via pdfplumber. Same on both pages because the footer band repeats.
# pdfplumber gives top-down coords; convert to PDF native (bottom-up).
RECT = {
    'x0': 444.0,            # leftward expansion — clear of left-column body text
    'x1': 562.0,
    'y0': PAGE_H - 729.0,   # 63
    'y1': PAGE_H - 717.5,   # 74.5
}
TEXT_RIGHT_X = 560.4
TEXT_BASELINE_Y = PAGE_H - 727.0  # 65

NAVY = HexColor('#0A1F33')      # band bg
YELLOW = HexColor('#F2D34F')    # link color


def main() -> None:
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=(612, 792))
    c.setFillColor(NAVY)
    c.rect(
        RECT['x0'], RECT['y0'],
        RECT['x1'] - RECT['x0'], RECT['y1'] - RECT['y0'],
        stroke=0, fill=1,
    )
    c.setFillColor(YELLOW)
    font_size = 7.0
    while font_size > 5.0:
        width = c.stringWidth(NEW_URL, 'Helvetica-Bold', font_size)
        if width <= (RECT['x1'] - RECT['x0'] - 2):
            break
        font_size -= 0.1
    print(f'font={font_size:.1f}pt  text-width={width:.1f}pt  rect-width={RECT["x1"]-RECT["x0"]:.1f}pt')
    c.setFont('Helvetica-Bold', font_size)
    c.drawRightString(TEXT_RIGHT_X, TEXT_BASELINE_Y, NEW_URL)
    c.showPage()
    c.save()
    buf.seek(0)

    overlay = PdfReader(buf).pages[0]
    reader = PdfReader(PDF_PATH)
    writer = PdfWriter()
    for page in reader.pages:
        page.merge_page(overlay)
        writer.add_page(page)
    with open(PDF_PATH, 'wb') as f:
        writer.write(f)
    print(f'Wrote {PDF_PATH}')


if __name__ == '__main__':
    main()
