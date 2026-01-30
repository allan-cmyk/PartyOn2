"""
Mobile responsiveness test for Group Ordering V2 pages.
Bypasses age verification, creates a real group order via API,
then takes screenshots at 3 viewport sizes.
"""

import os
import json
import time
from urllib.request import Request, urlopen
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "test-screenshots")

VIEWPORTS = {
    "mobile": {"width": 375, "height": 812},
    "tablet": {"width": 768, "height": 1024},
    "desktop": {"width": 1440, "height": 900},
}


def api_post(path, data):
    """Make a POST request to the local API."""
    req = Request(
        f"{BASE_URL}{path}",
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def create_test_group():
    """Create a group order with items via the API for realistic screenshots."""
    # Create group
    result = api_post("/api/v2/group-orders", {
        "name": "Jake's Bachelor Party 2026",
        "hostName": "Jake Thompson",
        "hostEmail": "jake@example.com",
        "hostPhone": "512-555-1234",
        "tabs": [
            {
                "name": "Lake House Friday",
                "deliveryDate": "2026-03-06T00:00:00.000Z",
                "deliveryTime": "2:00 PM - 4:00 PM",
                "deliveryAddress": {
                    "address1": "1200 Barton Springs Rd",
                    "city": "Austin",
                    "province": "TX",
                    "zip": "78704",
                    "country": "US",
                },
                "deliveryNotes": "Gate code: 4321. Park in driveway.",
            },
            {
                "name": "Boat Party Saturday",
                "deliveryDate": "2026-03-07T00:00:00.000Z",
                "deliveryTime": "10:00 AM - 12:00 PM",
                "deliveryAddress": {
                    "address1": "2215 Westlake Dr",
                    "city": "Austin",
                    "province": "TX",
                    "zip": "78746",
                    "country": "US",
                },
                "deliveryNotes": "Meet at the dock.",
            },
        ],
    })
    share_code = result.get("shareCode")
    host_id = result.get("host", {}).get("id")
    print(f"  Created group: {share_code} (host: {host_id})")

    # Join as guest
    guest = api_post(f"/api/v2/group-orders/{share_code}/join", {
        "name": "Mike Rivera",
        "email": "mike@example.com",
        "ageVerified": True,
    })
    guest_id = guest.get("participant", {}).get("id")
    print(f"  Guest joined: {guest_id}")

    # Get tabs
    req = Request(f"{BASE_URL}/api/v2/group-orders/{share_code}")
    with urlopen(req) as resp:
        group_data = json.loads(resp.read().decode("utf-8"))
    tab_id = group_data["tabs"][0]["id"]
    tab2_id = group_data["tabs"][1]["id"]

    # Add items to tab 1 (host)
    if host_id and tab_id:
        api_post(f"/api/v2/group-orders/{share_code}/tabs/{tab_id}/items", {
            "participantId": host_id,
            "productId": "placeholder-product-1",
            "variantId": "placeholder-variant-1",
            "title": "Tito's Handmade Vodka 1.75L",
            "variantTitle": "1.75 Liter",
            "price": 34.99,
            "imageUrl": "",
            "quantity": 2,
        })
        api_post(f"/api/v2/group-orders/{share_code}/tabs/{tab_id}/items", {
            "participantId": host_id,
            "productId": "placeholder-product-2",
            "variantId": "placeholder-variant-2",
            "title": "Ranch Water 12-Pack",
            "variantTitle": "12 Pack",
            "price": 18.99,
            "imageUrl": "",
            "quantity": 3,
        })
        print("  Host items added to tab 1")

    # Add items to tab 1 (guest)
    if guest_id and tab_id:
        api_post(f"/api/v2/group-orders/{share_code}/tabs/{tab_id}/items", {
            "participantId": guest_id,
            "productId": "placeholder-product-3",
            "variantId": "placeholder-variant-3",
            "title": "Deep Eddy Lemon Vodka 750ml",
            "variantTitle": "750ml",
            "price": 22.99,
            "imageUrl": "",
            "quantity": 1,
        })
        api_post(f"/api/v2/group-orders/{share_code}/tabs/{tab_id}/items", {
            "participantId": guest_id,
            "productId": "placeholder-product-4",
            "variantId": "placeholder-variant-4",
            "title": "Lone Star Beer 12-Pack",
            "variantTitle": "12 Pack",
            "price": 14.99,
            "imageUrl": "",
            "quantity": 2,
        })
        print("  Guest items added to tab 1")

    # Add item to tab 2 (host)
    if host_id and tab2_id:
        api_post(f"/api/v2/group-orders/{share_code}/tabs/{tab2_id}/items", {
            "participantId": host_id,
            "productId": "placeholder-product-5",
            "variantId": "placeholder-variant-5",
            "title": "Modelo Especial 24-Pack",
            "variantTitle": "24 Pack",
            "price": 29.99,
            "imageUrl": "",
            "quantity": 1,
        })
        print("  Host items added to tab 2")

    return share_code, host_id, guest_id


def bypass_age_verification(page):
    """Click the YES I AM 21+ button if the age verification modal appears."""
    try:
        yes_btn = page.locator("text=YES, I AM 21+").first
        if yes_btn.is_visible(timeout=3000):
            yes_btn.click()
            page.wait_for_timeout(500)
            print("    Age verification bypassed")
            return True
    except Exception:
        pass
    return False


def take_screenshots(share_code):
    """Take screenshots of all V2 pages at all viewport sizes."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    pages_to_test = [
        {"name": "create", "path": "/group-v2/create"},
        {"name": "join", "path": f"/group-v2/{share_code}"},
        {"name": "dashboard", "path": f"/group-v2/{share_code}/dashboard"},
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for vp_name, vp_size in VIEWPORTS.items():
            print(f"\n--- Viewport: {vp_name} ({vp_size['width']}x{vp_size['height']}) ---")
            context = browser.new_context(
                viewport=vp_size,
                device_scale_factor=2 if vp_name == "mobile" else 1,
            )
            # Set age verification in localStorage to skip the modal
            page = context.new_page()
            page.goto(BASE_URL, wait_until="networkidle", timeout=30000)
            bypass_age_verification(page)
            # Set localStorage directly for subsequent navigations
            page.evaluate("() => { localStorage.setItem('ageVerified', 'true'); }")
            page.wait_for_timeout(300)

            for pg in pages_to_test:
                url = f"{BASE_URL}{pg['path']}"
                filename = f"{pg['name']}_{vp_name}.png"
                filepath = os.path.join(OUTPUT_DIR, filename)

                print(f"  Loading {pg['name']} ({url})...")
                try:
                    page.goto(url, wait_until="networkidle", timeout=30000)
                    page.wait_for_timeout(2000)  # let animations/SWR settle
                    # Try to bypass age verification again if it appears
                    bypass_age_verification(page)
                    page.wait_for_timeout(500)
                    page.screenshot(path=filepath, full_page=True)
                    print(f"  -> Saved: {filename}")
                except Exception as e:
                    print(f"  -> ERROR on {pg['name']}: {e}")
                    try:
                        page.screenshot(path=filepath, full_page=True)
                        print(f"  -> Saved error state: {filename}")
                    except Exception:
                        print(f"  -> Could not capture screenshot")

            context.close()

        browser.close()

    print(f"\nAll screenshots saved to: {OUTPUT_DIR}")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        if f.endswith(".png"):
            size_kb = os.path.getsize(os.path.join(OUTPUT_DIR, f)) // 1024
            print(f"  {f} ({size_kb} KB)")


def main():
    print("=== Step 1: Create test group order via API ===")
    try:
        share_code, host_id, guest_id = create_test_group()
    except Exception as e:
        print(f"  Failed to create test group: {e}")
        print("  Falling back to TESTCODE placeholder")
        share_code = "TESTCODE"

    print(f"\n=== Step 2: Take screenshots (share code: {share_code}) ===")
    take_screenshots(share_code)


if __name__ == "__main__":
    main()
