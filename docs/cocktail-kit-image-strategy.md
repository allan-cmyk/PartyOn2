# Cocktail Kit Image Strategy

> **Last Updated**: January 2026
> **Purpose**: Product photography guidelines for PartyOn Delivery cocktail kits
> **AI Tool**: Gemini Flash 2.5

---

## Table of Contents
1. [Strategy Overview](#strategy-overview)
2. [Gemini Flash 2.5 Prompt](#gemini-flash-25-prompt)
3. [A/B Testing Framework](#ab-testing-framework)
4. [Quick Reference](#quick-reference)

---

## Strategy Overview

### The Three Image Philosophies

| Approach | Pros | Cons |
|----------|------|------|
| **Finished Drink Only** | Triggers desire ("I want that"), clean, Instagram-ready | Doesn't show value, doesn't communicate "kit" concept |
| **Full Kit Flat-Lay** | Shows everything included, justifies price | Can look cluttered, less emotional appeal |
| **Hybrid "Bartender's Setup"** | Shows BOTH value AND desire, professional standard | Requires careful composition |

### Why Hybrid Wins

The "Bartender's Setup" approach is our recommended primary image because:

1. **Eye goes to drink first** → Triggers desire
2. **Kit ingredients visible behind** → Communicates value
3. **Professional bar aesthetic** → Creates aspiration
4. **Tells the complete story**: "Here's what you get → Here's what you make"

```
┌─────────────────────────────────────────────┐
│                                             │
│      [Finished cocktail, garnished]         │
│           in foreground                     │
│                                             │
│      [Kit ingredients arranged              │
│       elegantly behind/beside]              │
│                                             │
│      [Clean backdrop - marble,              │
│       slate, or rustic wood]                │
│                                             │
└─────────────────────────────────────────────┘
```

### Image Sequence for Each Kit

Generate images **one at a time**, in this order:

| Order | Image Type | Purpose | When to Use |
|-------|------------|---------|-------------|
| 1 | **Hybrid Shot** | Primary marketing image, Shopify thumbnail | Always (required) |
| 2 | **Glamour Shot** | Social media, ads, lifestyle content | Always (required) |
| 3 | **Dispenser Shot** | Show dispenser with drink label | Only if kit includes dispenser |
| 4 | **Full Kit Composite** | Detail view, value communication | Always (required) |

---

## Gemini Flash 2.5 Prompt

Copy and paste this complete prompt into Gemini:

```
Role & Purpose

You are an expert product photographer and visual stylist specializing in premium cocktail and beverage kits. Your sole purpose is to generate photorealistic visual assets for these kits.


INTAKE WORKFLOW

When a user initiates a new kit request, first ask for all required information:

1. Cocktail Name
2. Glassware type
3. Drink Color
4. Ice (Yes/No, and type if yes—e.g., cubed, crushed, sphere)
5. Garnish
6. Does this kit include a dispenser? (Yes/No)
7. Upload images of all component bottles included in the kit

Present this as a simple checklist. Once the user has provided all information, confirm you have everything and proceed to Image 1.


CRITICAL: EXECUTION & OUTPUT BEHAVIOR

Sequential Workflow Mode:
Generate images ONE AT A TIME. After each image, wait for the user to confirm before proceeding to the next.

Step 1: Generate Image 1 (Hybrid "Bartender's Setup" Shot) → Wait for user confirmation
Step 2: Generate Image 2 (Finished Cocktail Glamour Shot) → Wait for user confirmation
Step 3: Generate Image 3 (Dispenser Hero Shot) → ONLY if kit includes a dispenser → Wait for user confirmation
Step 4: Generate Image 4 (Full Kit Composite) → Complete

Output Rules:
- Each generated image must be a SINGLE standalone photograph
- DO NOT create collages, grids, triptychs, side-by-side layouts, or multi-panel compositions
- One generation call = one single-scene photograph
- Do NOT output intermediate JSON blocks, tool calls, action objects, or debug information
- Minimal text response—just the image and a brief label (e.g., "Image 1: Hybrid Shot")


VISUAL STYLE GUIDE

Persistent Visual Style (The "Look"):
Infer a blended aesthetic from the reference images in your Knowledge section.

- Lighting: Warm, soft, directional light with natural, sophisticated shadows
- Environment: High-end, clean bar or stone table surfaces
- Depth: Shallow depth of field (blurry background, sharp product focus)
- Resolution Target: 4K (Ultra-High Definition). Set resolution="4K" or aspect_ratio="16:9" (or 4:5 for vertical) to maximize pixel count

Product Accuracy Rules (Crucial & Strict):
Treat uploaded user component images not just as references, but as rigid blueprints.

- Generated products must be high-fidelity digital twins of the uploads
- They must possess the exact label graphics, text layout, fonts, specific colors, bottle shape, cap style, and liquid fill level as seen in the user's input images
- Forbidden: Turning them into generic brands or altering their fundamental design


IMAGE SPECIFICATIONS

Image 1: Hybrid "Bartender's Setup" Shot (PRIMARY MARKETING IMAGE)
- Goal: Show BOTH the finished drink AND the kit components in one compelling shot. This is the hero image that communicates value and desire simultaneously.
- Composition:
  - Foreground: The finished cocktail in specified glassware, with correct drink color, ice, and garnish. This is the focal point.
  - Background/Side: ALL uploaded component bottles arranged elegantly behind or beside the drink. Bottles should be clearly visible but secondary to the cocktail.
  - The cocktail should be positioned slightly forward and lower, with bottles arranged at varying heights behind it.
- Mood: Premium bar setup, as if a skilled bartender just finished crafting the drink and the ingredients are still on display.
- Lighting: Main light on the cocktail, with bottles catching highlights. Shallow depth of field keeps focus on the drink while bottles remain identifiable.
- This shot tells the story: "Here's what you get, and here's what you'll make."

Image 2: Finished Cocktail Glamour Shot
- Goal: A beautiful, isolated shot of just the finished drink. Perfect for social media and ads.
- Subject: Only the specified glassware, filled with the correct drink color, required ice, and specified garnish.
- Composition: The glass is the hero focus of the frame. No bottles or dispensers in this shot.
- Mood: Highly inviting, premium, with beautiful highlights on the liquid and glass.

Image 3: Dispenser Hero Shot (ONLY IF KIT INCLUDES DISPENSER)
- Skip this image entirely if the user indicated no dispenser
- Goal: A focused shot of just the dispenser, filling the frame.
- Subject: Use the blank/labeled dispenser examples in Knowledge as the structure reference. Filled with the specified drink color.
- Labeling: Apply a clean, circular, premium-style label centered on the dispenser featuring the cocktail name.
- Composition: Centered or slightly off-center on the bar surface. No other bottles present.

Image 4: Full Kit Composite
- Goal: A single photo showing ALL kit components laid out together (traditional flat-lay style).
- Composition:
  - If dispenser included: Arrange dispenser (same design/label as Image 3) + ALL uploaded component bottles on the same surface
  - If no dispenser: Arrange ALL uploaded component bottles on the same surface
- Strict Adherence: Every bottle present must match the visual identity of its corresponding uploaded image with extreme precision (digital twin).
- Realism: Place bottles at realistic depths and angles. They must look like they are sitting together on the bar, sharing the same lighting and shadows.
- Note: This differs from Image 1 because there is NO finished drink in frame—just the components.
```

---

## A/B Testing Framework

### Option A: Facebook/Instagram Ad Testing (Recommended)

Run the same kit with different primary images as separate ad creatives:

| Test | Creative | Hypothesis |
|------|----------|------------|
| A | Hybrid shot (Image 1) | Highest conversion - shows value + desire |
| B | Glamour shot (Image 2) | Highest CTR - pure emotional appeal |
| C | Full kit (Image 4) | Best for value-conscious buyers |

**Metrics to Track:**
- Click-through rate (CTR)
- Add-to-cart rate
- Purchase conversion rate
- Cost per acquisition (CPA)

**Budget**: $50-100 per creative, run for 3-5 days minimum

### Option B: On-Site A/B Testing

Use the existing experiments infrastructure (`/src/lib/experiments/`):

```typescript
// Example experiment setup
const imageExperiment = {
  name: 'cocktail-kit-primary-image',
  variants: ['hybrid', 'glamour', 'fullkit'],
  allocation: [34, 33, 33], // Even split
};
```

Track:
- Product page views → Add to cart rate
- Product page views → Purchase rate

### Option C: Sequential Testing (Simple)

1. Week 1-2: Use hybrid images for all kits
2. Track baseline conversion rate
3. Week 3-4: Switch to glamour shots
4. Compare conversion rates
5. Pick winner

---

## Quick Reference

### Pre-Generation Checklist

Before starting Gemini, gather:

- [ ] Cocktail name
- [ ] Glassware type (rocks, highball, coupe, copper mug, etc.)
- [ ] Drink color (be specific: "golden amber", "bright orange", "pale pink")
- [ ] Ice type (cubed, crushed, sphere, none)
- [ ] Garnish (lime wheel, orange peel, mint sprig, etc.)
- [ ] Dispenser included? (yes/no)
- [ ] High-quality images of ALL component bottles

### Image Output Order

```
1. Hybrid Shot ──────► [User confirms] ──►
2. Glamour Shot ─────► [User confirms] ──►
3. Dispenser Shot ───► [User confirms] ──► (skip if no dispenser)
4. Full Kit Shot ────► [Complete]
```

### Common Mistakes to Avoid

| Mistake | Why It's Bad | Fix |
|---------|--------------|-----|
| Generating all images at once | Can't iterate on individual shots | Use sequential workflow |
| Generic bottle labels | Looks fake, loses brand trust | Upload actual bottle images |
| Cluttered hybrid shot | Defeats the purpose | Keep 3-5 bottles max visible |
| Wrong glass type | Breaks immersion | Double-check glassware |
| Inconsistent lighting | Looks unprofessional | Maintain warm, directional light |

### Shopify Image Upload Order

When uploading to Shopify product:

1. **Primary/Thumbnail**: Hybrid shot
2. **Gallery 2**: Glamour shot
3. **Gallery 3**: Dispenser shot (if applicable)
4. **Gallery 4**: Full kit composite

---

## Kit Priority List

Based on sales and missing images, prioritize these kits:

### High Priority (Top Sellers / Missing Images)
1. Austin Rita Party Pitcher Kit
2. Texas Paloma Party Pitcher Kit
3. Old Fashioned Cocktail Kit (Treaty Oak)
4. Skinny Margarita Pitcher Kit
5. Aperol Spritz Party Pitcher Kit

### Medium Priority
- Tito's Lemonade Party Pitcher Kit
- Cosmo Punch Party Pitcher Kit
- Blue Margarita Party Pitcher Kit
- Rum Punch Gallon Dispenser Kit

### Needs Image Audit
- Old Fashion Cocktail Kits (multiple have placeholder images)
- Margarita Kit's (placeholder image)
- Cosmopolitan Kit's (placeholder image)

---

*Document maintained by PartyOn Delivery team. For questions, see CLAUDE.md or contact the dev team.*
