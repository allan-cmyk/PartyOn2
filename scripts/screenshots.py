"""Capture V2 page screenshots at 3 viewport sizes, bypassing age verification."""
import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = os.path.join(os.path.dirname(__file__), "..", "test-screenshots")
CODE = "34Q8MK"

VIEWPORTS = {
    "mobile": {"width": 375, "height": 812, "scale": 2},
    "tablet": {"width": 768, "height": 1024, "scale": 1},
    "desktop": {"width": 1440, "height": 900, "scale": 1},
}

PAGES = [
    ("create", f"/group-v2/create"),
    ("join", f"/group-v2/{CODE}"),
    ("dashboard", f"/group-v2/{CODE}/dashboard"),
]

os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    for vp_name, vp in VIEWPORTS.items():
        print(f"\n--- {vp_name} ({vp['width']}x{vp['height']}) ---")
        ctx = browser.new_context(
            viewport={"width": vp["width"], "height": vp["height"]},
            device_scale_factor=vp["scale"],
        )
        page = ctx.new_page()

        # Bypass age verification by setting localStorage on any page first
        page.goto(BASE, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(1000)
        # Click the age verification button
        try:
            btn = page.locator("text=YES, I AM 21+")
            if btn.count() > 0:
                btn.first.click()
                page.wait_for_timeout(500)
                print("  Age verification clicked")
        except Exception:
            pass
        # Also set localStorage
        page.evaluate("localStorage.setItem('ageVerified', 'true')")
        page.wait_for_timeout(300)

        for name, path in PAGES:
            url = f"{BASE}{path}"
            out_file = os.path.join(OUT, f"{name}_{vp_name}.png")
            print(f"  {name}: {url}")
            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
                page.wait_for_timeout(2000)
                # Try clicking age verify again if it shows up
                try:
                    btn = page.locator("text=YES, I AM 21+")
                    if btn.count() > 0 and btn.first.is_visible():
                        btn.first.click()
                        page.wait_for_timeout(1000)
                except Exception:
                    pass
                page.screenshot(path=out_file, full_page=True)
                sz = os.path.getsize(out_file) // 1024
                print(f"    saved ({sz} KB)")
            except Exception as e:
                print(f"    ERROR: {e}")

        ctx.close()

    browser.close()
    print("\nDone.")
