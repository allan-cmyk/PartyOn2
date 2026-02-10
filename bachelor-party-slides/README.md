# 🎩 A Gentleman's Evening - Lake Travis Bachelor Party Deck

An interactive, scroll-based HTML presentation built with Reveal.js showcasing a premium bachelor party experience using Party On Delivery services.

## 📋 Overview

This Gamma-style presentation combines the professional polish of a VC pitch deck with the warmth and accessibility suitable for sharing with friends and family (the "VC or grandma" test). It features:

- **12 comprehensive slides** with rich content (1,500+ words total)
- **Aquatic Luxury design theme** (Deep Teal, Warm Amber, Vibrant Coral)
- **Interactive timeline** and data visualizations
- **Full-bleed imagery** from Party On Delivery gallery
- **Responsive design** optimized for desktop, tablet, and mobile
- **Professional typography** (Crimson Pro + Bricolage Grotesque)

## 🎨 Design Specifications

### Color Palette
- **Primary**: Deep Teal (#0B7285) - trust, water, premium
- **Accent Gold**: Warm Amber (#F59E0B) - luxury, celebration
- **Accent Coral**: Vibrant Coral (#FF6B6B) - energy, excitement
- **Neutral Dark**: Rich Navy (#1E3A5F) - sophistication
- **Neutral Light**: Off-White (#F8F9FA) - clean, spacious

### Typography
- **Display Font**: Crimson Pro (Google Fonts) - Headings, hero text
- **Body Font**: Bricolage Grotesque (Google Fonts) - Readable body copy
- **Hierarchy**: 72pt → 48pt → 32pt → 20pt with generous letter-spacing

## 🚀 Quick Start

### Option 1: Open Directly in Browser (Easiest)

Simply open `index.html` in any modern web browser:

```bash
# From the bachelor-party-slides directory
open index.html  # macOS
start index.html # Windows
xdg-open index.html # Linux
```

No server required! All assets are either CDN-linked or locally referenced.

### Option 2: Run with Local Server (Recommended for Testing)

For best compatibility and to avoid CORS issues with some browsers:

```bash
# Python 3
python3 -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000

# Then visit: http://localhost:8000
```

## 📂 File Structure

```
bachelor-party-slides/
├── index.html              # Main presentation file
├── css/
│   └── theme.css          # Custom Aquatic Luxury theme
├── images/                # Local image assets
│   ├── sunset-champagne-pontoon.png
│   ├── premium-spirits-wall.png
│   ├── branded-delivery-bag.png
│   ├── lake-travis-boats.webp
│   └── curated-spirits-display.webp
└── README.md              # This file
```

## 🎯 Slide Breakdown

1. **Hero Title** - Full-bleed sunset imagery with compelling headline
2. **The Vision** - Split layout introducing the bachelor party concept
3. **The Problem** - Dark theme highlighting DIY party pain points
4. **The Solution** - Party On Delivery service introduction
5. **The Experience** - Detailed timeline of event day
6. **The Package** - Complete pricing breakdown table
7. **The Investment** - Cost comparison charts and per-person analysis
8. **The Timeline** - 6-month planning roadmap
9. **The Logistics** - Event details and what to bring/expect
10. **Social Proof** - Customer reviews and stats
11. **The ROI** - Value proposition and true benefits
12. **Call to Action** - Clear next steps for attendees

## 🎮 Navigation Controls

- **Arrow Keys**: Navigate between slides
- **Space Bar**: Next slide
- **Home**: First slide
- **End**: Last slide
- **ESC**: Slide overview mode
- **F**: Fullscreen mode
- **S**: Speaker notes (if enabled)

## 📱 Responsive Design

The presentation automatically adapts to different screen sizes:

- **Desktop (1920x1080)**: Full experience with multi-column layouts
- **Tablet (768px-1024px)**: Adjusted column counts, optimized spacing
- **Mobile (<768px)**: Single-column layouts, larger touch targets

## ✏️ Customization Guide

### 1. Update Event Details

Replace placeholder text in **Slide 9 (Logistics)**:
- `[specific date]` → Your actual bachelor party date
- `[Specific dock/marina name]` → Confirmed marina location
- `[Date 4 weeks before event]` → RSVP deadline
- `[organizer name]` → Best man or coordinator name

### 2. Update Contact Information

In **Slide 12 (Call to Action)**:
- `[Organizer Name]` → Your name
- `[email@example.com]` → Your email
- `[(512) 555-0123]` → Your phone
- `[Group chat link]` → WhatsApp/GroupMe invite link

### 3. Customize Package Contents

In **Slide 6 (The Package)**, modify the table to reflect your actual order:
- Adjust spirit brands and quantities
- Update pricing to match current Party On Delivery rates
- Add/remove items based on group preferences

### 4. Adjust Timeline Dates

In **Slide 8 (The Timeline)**, update milestone dates:
- Calculate backwards from your event date
- Add specific deadlines for deposits and RSVPs
- Update Party On Delivery order deadline (72 hours before)

## 🌐 Deployment Options

### Option A: Email Distribution (Simplest)

The entire presentation is a single HTML file that can be:
1. Zipped with the `css/` and `images/` folders
2. Shared via email or cloud storage (Google Drive, Dropbox)
3. Opened directly by recipients in any browser

```bash
# Create distributable zip
zip -r bachelor-party-deck.zip bachelor-party-slides/
```

### Option B: Host on Vercel (Free, Professional)

1. Install Vercel CLI (if not already installed):
```bash
npm install -g vercel
```

2. Deploy from the bachelor-party-slides directory:
```bash
cd bachelor-party-slides
vercel
```

3. Follow prompts to create free account and deploy
4. Get shareable URL: `https://bachelor-party-deck-abc123.vercel.app`

### Option C: Host on Netlify (Free, Drag & Drop)

1. Visit [app.netlify.com](https://app.netlify.com/)
2. Drag the `bachelor-party-slides` folder onto the deployment zone
3. Get instant shareable URL

### Option D: GitHub Pages (Free, Version Control)

1. Create new GitHub repository
2. Push the `bachelor-party-slides` folder
3. Enable GitHub Pages in repository settings
4. Access at: `https://[username].github.io/bachelor-party-deck`

## 🔗 Sharing Best Practices

### For Group Distribution
- **Use a short URL**: Bit.ly or TinyURL to make links memorable
- **Include context**: "Check out the bachelor party deck I made: [link]"
- **Set permissions**: If hosting on Google Drive, ensure "Anyone with link can view"

### For Social Sharing
- **WhatsApp**: URL auto-generates preview from page metadata
- **Facebook/LinkedIn**: Shows hero image and title automatically
- **Email**: Works as both embedded link or zipped attachment

### For Print Distribution
1. Open in Chrome browser
2. Press `Ctrl/Cmd + P` to print
3. Select "Save as PDF"
4. Choose "Landscape" orientation
5. Results in 12-page PDF (one slide per page)

## 🎨 Advanced Customization

### Change Color Scheme

Edit `/css/theme.css` root variables:
```css
:root {
  --color-primary: #0B7285;        /* Your primary color */
  --color-accent-gold: #F59E0B;    /* Your accent color */
  --color-accent-coral: #FF6B6B;   /* Your secondary accent */
  --color-dark: #1E3A5F;           /* Dark text color */
  --color-light: #F8F9FA;          /* Light background */
}
```

### Replace Images

Replace files in `/images/` directory while keeping the same filenames, or update image paths in `index.html`:

```html
<!-- Example: Update hero background -->
<section data-background="images/your-new-image.jpg">
```

### Add Google Maps Embed

In **Slide 9**, replace the map placeholder with:
```html
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!..."
  width="100%"
  height="400"
  style="border:0; border-radius: 12px;"
  allowfullscreen=""
  loading="lazy">
</iframe>
```

Get embed code from [Google Maps](https://www.google.com/maps) → Share → Embed a map

### Enable Speaker Notes

Reveal.js supports speaker notes. Add them to any slide:

```html
<section>
  <h2>Your Slide Content</h2>
  <aside class="notes">
    These are your private speaker notes.
    Press 'S' to open speaker view.
  </aside>
</section>
```

## 📊 Data Visualization Options

The presentation includes basic tables. For interactive charts:

1. Chart.js is already loaded via CDN
2. Add a canvas element to any slide:
```html
<canvas id="myChart"></canvas>
```

3. Initialize chart in the `<script>` section:
```javascript
const ctx = document.getElementById('myChart');
new Chart(ctx, {
  type: 'bar',
  data: { /* your data */ }
});
```

Example use cases:
- Cost comparison bar charts
- Budget breakdown pie charts
- RSVP progress visualization

## 🧪 Testing Checklist

Before sharing with your group:

- [ ] All placeholder text replaced with actual details
- [ ] Event date, time, and location confirmed
- [ ] Contact information updated (email, phone, group chat link)
- [ ] Package pricing matches current Party On Delivery rates
- [ ] Timeline dates calculated correctly (work backwards from event)
- [ ] All images load correctly (no broken image icons)
- [ ] Test on mobile device (portrait and landscape)
- [ ] Test in Safari, Chrome, Firefox browsers
- [ ] Links to PartyOnDelivery.com work correctly
- [ ] Print/PDF export looks clean (test with Cmd/Ctrl + P)

## 🎯 Success Metrics

This deck succeeds when:
- ✅ **80%+ "YES" RSVPs** within 2 weeks of sharing
- ✅ **Zero logistics questions** (all details covered in deck)
- ✅ **Easy sharing** (link works for everyone, any device)
- ✅ **Professional impression** (reflects well on organizer)
- ✅ **Excitement generated** (people are genuinely hyped)

## 📞 Support & Credits

### Built With
- **Reveal.js** - HTML presentation framework ([revealjs.com](https://revealjs.com))
- **Google Fonts** - Crimson Pro & Bricolage Grotesque
- **Chart.js** - Data visualization library (optional)
- **Party On Delivery** - Premium alcohol delivery ([partyondelivery.com](https://partyondelivery.com))

### Resources
- Reveal.js documentation: [revealjs.com/docs](https://revealjs.com/)
- Google Fonts: [fonts.google.com](https://fonts.google.com)
- Bachelor party planning best practices: Various event planning sources

### Template Created By
This presentation template was designed following Gamma-style presentation principles and bachelor party planning best practices researched from leading event coordination sources.

## 📝 License

This template is free to use, customize, and share for personal bachelor party planning purposes. Images are property of Party On Delivery.

---

**Ready to launch your legendary bachelor party?**

1. Customize the details above
2. Test on your device
3. Deploy or share
4. Collect those "YES" responses
5. Order from Party On Delivery 72 hours before your event

Questions? Contact Party On Delivery at [partyondelivery.com](https://partyondelivery.com)
