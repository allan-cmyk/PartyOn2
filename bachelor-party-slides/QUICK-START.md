# 🚀 Quick Start Guide - Bachelor Party Deck

## Open the Presentation (2 minutes)

**Option 1: Double-click `index.html`**
- Works immediately in any browser
- No setup required

**Option 2: Run local server (recommended)**
```bash
cd bachelor-party-slides
python3 -m http.server 8000
# Visit: http://localhost:8000
```

## Customize in 10 Minutes

### Step 1: Update Event Details (Slide 9)
Open `index.html` in any text editor and search for these placeholders:

| Find This | Replace With |
|-----------|--------------|
| `[Weekend 3-4 months out]` | Your actual date (e.g., "Saturday, June 15, 2024") |
| `[Specific dock/marina name TBD]` | Actual marina (e.g., "Just For Fun Marina") |
| `[Date 4 weeks before event]` | RSVP deadline (e.g., "May 15, 2024") |

### Step 2: Update Contact Info (Slide 12)
Search for these and replace:

| Find This | Replace With |
|-----------|--------------|
| `[Organizer Name]` | Your name (e.g., "Mike Thompson") |
| `[email@example.com]` | Your email |
| `[(512) 555-0123]` | Your phone |
| `[WhatsApp/GroupMe link will be shared]` | Actual group chat link |

### Step 3: Update Timeline Dates (Slide 8)
Search for `[specific date]` and replace with:
- Party On Delivery order deadline (72 hours before event)
- RSVP deadline (4 weeks before)
- Deposit deadline (2 weeks from sharing deck)

### Step 4: Verify Package Pricing (Slide 6)
- Confirm prices with Party On Delivery current rates
- Update quantities if group size changes
- Adjust total calculation accordingly

## Share the Deck (3 options)

### Option A: Send as Zip File
```bash
cd ..
zip -r bachelor-party-deck.zip bachelor-party-slides/
# Email the .zip file to your group
```

### Option B: Deploy to Vercel (Free)
```bash
cd bachelor-party-slides
npx vercel
# Get shareable URL instantly
```

### Option C: Google Drive
1. Upload entire `bachelor-party-slides` folder to Google Drive
2. Share with "Anyone with link can view"
3. Recipients click on `index.html` → "Open with" → Google Chrome

## Navigation Shortcuts

- **Arrow Keys** or **Space**: Next slide
- **ESC**: Overview mode (see all slides)
- **F**: Fullscreen
- **Ctrl/Cmd + P**: Export to PDF

## Troubleshooting

**Images not loading?**
- Make sure `images/` folder is in same directory as `index.html`
- Check file names match exactly (case-sensitive)

**Fonts look wrong?**
- Ensure internet connection (fonts load from Google Fonts CDN)
- Try refreshing the page (Ctrl/Cmd + R)

**Reveal.js not working?**
- Check browser console (F12) for errors
- Ensure using modern browser (Chrome, Firefox, Safari, Edge)
- Try clearing cache and refreshing

## Quick Checklist Before Sharing

- [ ] Event date confirmed
- [ ] Location/marina confirmed
- [ ] Contact info updated
- [ ] RSVP deadline set
- [ ] Deposit amount decided
- [ ] Tested on mobile device
- [ ] All links work

## Need Help?

- **Reveal.js Issues**: [revealjs.com/docs](https://revealjs.com/)
- **Party On Delivery**: [partyondelivery.com](https://partyondelivery.com)
- **Technical Questions**: Check the full README.md

---

**That's it!** Open, customize 10 things, share. Your legendary bachelor party deck is ready to go.
