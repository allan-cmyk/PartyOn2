#!/usr/bin/env python3
"""
Patch public/email-assets/pod-partner-onepager.pdf so the "schedule a call"
footer on both pages is accurate. Supersedes the deleted
scripts/patch-onepager-calendly-url.py, whose overlay only painted over the
placeholder and left the dead link + hidden text in the file.

What it fixes, on each page:
  1. Link annotation https://your-calendly-link.com/ (unregistered domain)
     -> https://123.partyondelivery.com/partnership-call, with the click area
     widened to cover the whole visible URL.
  2. Removes the placeholder text "YOUR-CALENDLY-LINK.com" from the content
     for real (PyMuPDF redaction: text only, no fill, images and the #11181C
     footer band untouched). Also removes the old overlay's #0A1F33 cover
     rectangle (it no longer hides anything and did not match the band), then
     redraws the yellow URL exactly as the old overlay did (Helvetica-Bold,
     #F2D34F, right-aligned at x=560.4, baseline 65pt from the bottom).
  3. Heading "15 minutes." -> "30 minutes." (the Partnership Call is a
     30-minute Google Meet). The embedded Barlow Condensed ExtraBold subset has
     no "3"/"0" glyphs, so the digits use Barlow Condensed Bold
     (scripts/assets/barlow-condensed-700.ttf) with a same-colour 0.025em
     stroke, which brings Bold's 0.141em stem up to ExtraBold's 0.166em.
     " minutes." is redrawn with the PDF's own ExtraBold subset.
  4. The sentence under each heading now says it is a Google Meet video call.
     It is set in Manrope Regular, which has the same metrics as the embedded
     subset (checked at run time), at the original colour and 70% opacity.
  Glyphs are placed on the 0.75pt (1 CSS px) grid, with the letter-spacing
  measured from the original text, so spacing matches the Chrome export.

When to re-run: after re-exporting the one-pager from its design source, if
`pdftotext -layout` shows the placeholder, "15 minutes" or the Calendly link
again. Safe to re-run: on an already-patched file it changes nothing (exits 0).

Needs `pip3 install --user pymupdf`, plus a Manrope Regular TTF (Google Fonts
manrope-v20-latin-regular.ttf). Set ONEPAGER_MANROPE_TTF, or keep it at
design-system-bundle/fonts/manrope/ (untracked) in this or the main checkout.
Output is not byte-identical run to run; verify with --check, not a hash.

Usage:
  python3 scripts/patch-onepager-partnership-call.py           # patch in place
  python3 scripts/patch-onepager-partnership-call.py --check   # verify only
  python3 scripts/patch-onepager-partnership-call.py --in a.pdf --out b.pdf
"""
import argparse
import os
import statistics
import subprocess
import sys
from pathlib import Path

import fitz  # PyMuPDF

REPO = Path(__file__).resolve().parent.parent
PDF_PATH = REPO / 'public/email-assets/pod-partner-onepager.pdf'
BARLOW_BOLD_TTF = REPO / 'scripts/assets/barlow-condensed-700.ttf'
MANROPE_REL = 'design-system-bundle/fonts/manrope/manrope-v20-latin-regular.ttf'

NEW_URI = 'https://123.partyondelivery.com/partnership-call'
URL_TEXT = '123.partyondelivery.com/partnership-call'
PLACEHOLDER = 'your-calendly-link'
YELLOW = (0xF2 / 255, 0xD3 / 255, 0x4F / 255)
OLD_COVER_FILL = '#0A1F33'
PX = 0.75  # Chrome laid the page out on a 1 CSS px = 0.75pt grid

# Geometry below is in PyMuPDF coordinates (origin top-left, y down).
# Footer text redaction: covers the placeholder (y 718.5-727.5) and the old
# Helvetica URL (720.7-728.8) while staying clear of "SCHEDULE A MEETING"
# (ends 713.1), "allan@..." (starts 729.75) and page 2's body text (727.76).
FOOTER_TEXT_RECT = fitz.Rect(444.5, 719.0, 561.5, 727.4)
OLD_COVER_RECT = fitz.Rect(443.5, 717.0, 562.5, 729.5)  # old rect: 444,717.5-562,729
URL_RIGHT_X, URL_BASELINE = 560.4, 727.0
LINK_RECT = fitz.Rect(444.5, 718.5, 561.0, 727.5)  # PDF: [444.5 64.5 561 73.5]

HEADING_OLD, HEADING_NEW = '15 minutes.', '30 minutes.'
STEM_BOOST_EM = 0.025  # ExtraBold 'l' stem 0.166em minus Bold 0.141em

BODY_REWRITES = [
    (['Walkthrough of your portfolio, partner dashboard demo, and partnership '
      'terms. See page 2 for what we deliver.'],
     ['A Google Meet video call: portfolio walkthrough, partner dashboard demo, '
      'and partnership terms. See page 2.']),
    (["Allan walks through your portfolio and shows the partner dashboard. "
      "We'll outline what partnership looks like for your", 'properties.'],
     ["On a Google Meet video call, Allan walks through your portfolio and "
      "shows the partner dashboard. We'll outline what",
      'partnership looks like for your properties.']),
]


def hexcolor(rgb):
    """(r, g, b) floats -> '#RRGGBB'."""
    return '#%02X%02X%02X' % tuple(round(v * 255) for v in rgb)


def int_to_rgb(c):
    """PyMuPDF span colour int -> (r, g, b) floats."""
    return ((c >> 16) & 255) / 255, ((c >> 8) & 255) / 255, (c & 255) / 255


def spans(page):
    """Every text span on the page, with its characters."""
    out = []
    for block in page.get_text('rawdict')['blocks']:
        for line in block.get('lines', []):
            for sp in line['spans']:
                sp['text'] = ''.join(c['c'] for c in sp['chars'])
                out.append(sp)
    return out


def tight(bbox, dx=0.8, dy=1.5):
    """Shrink a span bbox so a redaction cannot touch neighbouring lines."""
    r = fitz.Rect(bbox)
    return fitz.Rect(r.x0 + dx, r.y0 + dy, r.x1 - 0.3, r.y1 - dy)


def px_advance(font, ch, size):
    """Glyph advance snapped to the 1px grid, as Chrome placed it."""
    return round(font.glyph_advance(ord(ch)) * size / PX) * PX


def letter_spacing(font, chars, size):
    """Median extra spacing between original glyphs beyond the px advance."""
    gaps = [b['origin'][0] - a['origin'][0] - px_advance(font, a['c'], size)
            for a, b in zip(chars, chars[1:]) if font.has_glyph(ord(a['c']))]
    return round(statistics.median(gaps), 3) if gaps else 0.0


def embedded_font(doc, page, name_part, text):
    """Buffer + Font of the embedded subset of `name_part` that has all of `text`."""
    for f in page.get_fonts(full=True):
        if name_part not in f[3]:
            continue
        buf = doc.extract_font(f[0])[3]
        if buf and all(fitz.Font(fontbuffer=buf).has_glyph(ord(c)) for c in set(text)):
            return buf, fitz.Font(fontbuffer=buf)
    raise SystemExit(f'No embedded {name_part} subset covers {text!r}')


def find_manrope(doc, page):
    """Locate Manrope Regular and prove its metrics match the embedded subset."""
    cands = [os.environ.get('ONEPAGER_MANROPE_TTF', ''), str(REPO / MANROPE_REL)]
    try:
        common = subprocess.run(['git', '-C', str(REPO), 'rev-parse', '--path-format=absolute',
                                 '--git-common-dir'], capture_output=True, text=True).stdout.strip()
        if common:
            cands.append(str(Path(common).parent / MANROPE_REL))
    except OSError:
        pass
    _, emb = embedded_font(doc, page, 'Manrope', 'Walkthrough')
    for path in filter(None, cands):
        if not Path(path).is_file():
            continue
        font = fitz.Font(fontfile=path)
        cps = [c for c in emb.valid_codepoints() if c > 32]
        if all(abs(font.glyph_advance(c) - emb.glyph_advance(c)) < 1e-3 for c in cps):
            return path, font
        print(f'  skip {path}: metrics differ from the embedded Manrope')
    raise SystemExit('Manrope Regular TTF not found - set ONEPAGER_MANROPE_TTF')


def opacity(sp):
    """Span alpha as a 0-1 opacity (the body copy is drawn at 70%)."""
    return round(sp.get('alpha', 255) / 255, 3)


def place(page, fontname, font, text, x, y, size, color, ls, op=1.0, **kw):
    """Draw text glyph by glyph on the px grid; returns the next pen x."""
    for ch in text:
        page.insert_text((x, y), ch, fontname=fontname, fontsize=size, color=color,
                         fill_opacity=op, stroke_opacity=op, **kw)
        x += px_advance(font, ch, size) + ls
    return x


def find_body(page_spans, old_lines):
    """Spans matching every line of an original body paragraph, or None."""
    found = []
    for line in old_lines:
        match = [s for s in page_spans if s['text'].strip() == line]
        if len(match) != 1:
            return None
        found.append(match[0])
    return found


def survey(page):
    """What on this page still needs fixing."""
    sp = spans(page)
    cover = [d for d in page.get_drawings() if d.get('fill')
             and hexcolor(d['fill']) == OLD_COVER_FILL and OLD_COVER_RECT.contains(d['rect'])]
    bodies = [(b, new) for old, new in BODY_REWRITES if (b := find_body(sp, old))]
    return {
        'spans': sp,
        'placeholder': [s for s in sp if PLACEHOLDER in s['text'].lower()],
        'cover': cover,
        'heading': [s for s in sp if s['text'].strip() == HEADING_OLD],
        'bodies': bodies,
    }


def redact(page, rects, graphics, text):
    """Apply no-fill redactions; images are never touched."""
    for r in rects:
        page.add_redact_annot(r, fill=False, cross_out=False)
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=graphics, text=text)


def url_font_size():
    """Replicates the old overlay's shrink-to-fit loop (7.0pt down to fit 116pt)."""
    size = 7.0
    while size > 5.0 and fitz.get_text_length(URL_TEXT, 'hebo', size) > 116.0:
        size -= 0.1
    return size


def redraw_heading(page, sp, eb, eb_buf, bold, bold_buf):
    """Redraw one '15 minutes.' span as '30 minutes.' at the same spot."""
    chars, size = sp['chars'], sp['size']
    color, op = int_to_rgb(sp['color']), opacity(sp)
    ls = letter_spacing(eb, chars, size)
    old_digits, new_digits = HEADING_OLD.split(' ')[0], HEADING_NEW.split(' ')[0]
    x, y = chars[0]['origin']
    page.insert_font(fontname='PocBarlowBold', fontbuffer=bold_buf)
    page.insert_font(fontname='PocBarlowXB', fontbuffer=eb_buf)
    x = place(page, 'PocBarlowBold', bold, new_digits, x, y, size, color, ls, op,
              fill=color, render_mode=2, border_width=STEM_BOOST_EM)
    shift = x - chars[len(old_digits)]['origin'][0]
    for c in chars[len(old_digits):]:
        place(page, 'PocBarlowXB', eb, c['c'], c['origin'][0] + shift, y, size, color, 0, op)
    return {'size': size, 'color': hexcolor(color), 'opacity': op, 'letter_spacing': ls, 'x': chars[0]['origin'][0],
            'baseline': y, 'digits_font': bold.name, 'rest_font': eb.name, 'shift': round(shift, 3)}


def redraw_body(page, old_spans, new_lines, manrope, manrope_path):
    """Replace a body paragraph with new lines on the original baselines."""
    first = old_spans[0]
    size, color, op = first['size'], int_to_rgb(first['color']), opacity(first)
    x0, y0 = first['chars'][0]['origin']
    pitch = (old_spans[1]['origin'][1] - y0) if len(old_spans) > 1 else 10.5
    ls = letter_spacing(manrope, first['chars'], size)
    page.insert_font(fontname='PocManrope', fontfile=manrope_path)
    ends = [place(page, 'PocManrope', manrope, line, x0, y0 + i * pitch, size, color, ls, op)
            for i, line in enumerate(new_lines)]
    return {'size': size, 'color': hexcolor(color), 'opacity': op, 'x': x0, 'baseline': y0, 'pitch': pitch,
            'letter_spacing': ls, 'line_right_edges': [round(e, 2) for e in ends]}


def fix_links(doc, page):
    """Point the footer link(s) at the partnership call and cover the whole URL."""
    h = page.mediabox.height
    pdf_rect = f'[{LINK_RECT.x0:g} {h - LINK_RECT.y1:g} {LINK_RECT.x1:g} {h - LINK_RECT.y0:g}]'
    changed = 0
    footer = [ln for ln in page.get_links() if ln.get('uri') and
              (PLACEHOLDER in ln['uri'].lower() or ln['from'].intersects(LINK_RECT))]
    for ln in footer:
        if ln['uri'] != NEW_URI or doc.xref_get_key(ln['xref'], 'Rect')[1] != pdf_rect:
            doc.xref_set_key(ln['xref'], 'A/URI', fitz.get_pdf_str(NEW_URI))
            doc.xref_set_key(ln['xref'], 'Rect', pdf_rect)
            changed += 1
    if not footer:
        page.insert_link({'kind': fitz.LINK_URI, 'from': LINK_RECT, 'uri': NEW_URI})
        changed += 1
    return changed


def patch_page(doc, page, fonts):
    """Apply every needed fix to one page; returns a log of what changed."""
    assert page.rotation == 0 and page.mediabox.y0 == 0, 'unexpected page geometry'
    s = survey(page)
    log = {}
    # Grab fonts before redaction rewrites the content stream.
    eb = embedded_font(doc, page, 'BarlowCondensed-ExtraBold', HEADING_OLD) if s['heading'] else None
    if s['cover']:
        redact(page, [OLD_COVER_RECT], fitz.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED,
               fitz.PDF_REDACT_TEXT_NONE)
        log['removed_cover_rects'] = len(s['cover'])
    rects = [tight(sp['bbox']) for sp in s['heading']]
    rects += [tight(sp['bbox']) for body, _ in s['bodies'] for sp in body]
    if s['placeholder']:
        rects.append(FOOTER_TEXT_RECT)
    if rects:
        redact(page, rects, fitz.PDF_REDACT_LINE_ART_NONE, fitz.PDF_REDACT_TEXT_REMOVE)
    if s['cover'] or rects:
        # Redaction deletes overlapping link annots; reload so get_links() is fresh.
        page = doc.reload_page(page)
    if s['placeholder']:
        size = url_font_size()
        x = URL_RIGHT_X - fitz.get_text_length(URL_TEXT, 'hebo', size)
        page.insert_text((x, URL_BASELINE), URL_TEXT, fontname='hebo', fontsize=size, color=YELLOW)
        log['url'] = {'x': round(x, 2), 'baseline': URL_BASELINE, 'size': size}
    for sp in s['heading']:
        log.setdefault('heading', []).append(redraw_heading(page, sp, eb[1], eb[0], *fonts['bold']))
    for body, new_lines in s['bodies']:
        log.setdefault('body', []).append(redraw_body(page, body, new_lines, *fonts['manrope']))
    log['links_changed'] = fix_links(doc, page)
    return {k: v for k, v in log.items() if v}


def verify(doc):
    """Text/geometry checks; returns a list of failures (empty = good)."""
    fails = []
    for i, page in enumerate(doc, 1):
        text = page.get_text()
        low = text.lower()
        links = [ln for ln in page.get_links() if ln.get('uri')]
        if not links or any(ln['uri'] != NEW_URI for ln in links):
            fails.append(f'p{i}: link URIs {[ln.get("uri") for ln in links]}')
        for bad in ('calendly', '15 minutes', '15-minute', '15 min'):
            if bad in low:
                fails.append(f'p{i}: still contains {bad!r}')
        for good in ('30 minutes', URL_TEXT, 'Google Meet'):
            if good not in text:
                fails.append(f'p{i}: missing {good!r}')
        if survey(page)['cover']:
            fails.append(f'p{i}: old {OLD_COVER_FILL} cover rectangle still present')
    return fails


def load_fonts(doc):
    """Barlow Condensed Bold (tracked) + Manrope Regular (metrics-checked)."""
    bold_buf = BARLOW_BOLD_TTF.read_bytes()
    bold = fitz.Font(fontbuffer=bold_buf)
    assert all(bold.has_glyph(ord(c)) for c in HEADING_NEW), 'Barlow Bold lacks digits'
    return {'bold': (bold, bold_buf), 'manrope': find_manrope(doc, doc[0])[::-1]}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('--in', dest='src', default=str(PDF_PATH))
    ap.add_argument('--out', dest='dst', default=None)
    ap.add_argument('--check', action='store_true', help='verify only, write nothing')
    args = ap.parse_args()
    doc = fitz.open(args.src)
    fails = verify(doc)
    if args.check or not fails:
        print('\n'.join(fails) or f'OK: {args.src} is already patched - nothing written')
        sys.exit(1 if fails else 0)
    fonts = load_fonts(doc)
    for i, page in enumerate(doc, 1):
        print(f'page {i}:', patch_page(doc, page, fonts))
    fails = verify(doc)
    if fails:
        raise SystemExit('Patch incomplete, nothing written:\n' + '\n'.join(fails))
    # garbage=2 drops the orphaned old content + link objects; 3 would merge the
    # two identical link annots into one object shared by both pages.
    data = doc.tobytes(garbage=2, deflate=True)
    doc.close()
    Path(args.dst or args.src).write_bytes(data)
    print(f'Wrote {args.dst or args.src}')


if __name__ == '__main__':
    main()
