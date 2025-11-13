# AI Concierge Prompts

This directory contains the personality and behavior definitions for PartyOn Delivery's AI assistants.

## Files

### `reginald.md`

**Reginald** - The distinguished British butler AI concierge

This markdown file controls Reginald's entire personality, speaking style, product knowledge, and mode-specific behaviors.

## How to Edit Reginald's Personality

### Quick Edits

1. Open `src/prompts/reginald.md`
2. Edit any section you want to change
3. Save the file
4. **Restart the dev server** or **rebuild** to clear the prompt cache

### What You Can Edit

#### ✅ Easy to Change

- **Personality traits** - Add or modify his characteristics
- **Speaking phrases** - Change his signature expressions
- **Product recommendations** - Update suggested items and prices
- **Service areas** - Add or remove Austin neighborhoods
- **Mode-specific behaviors** - Adjust bachelor/bachelorette/event planning tones

#### Example Edits

**Make Reginald more cheerful:**
```markdown
## Your Personality Traits

- You're a luxury butler with a surprisingly cheerful disposition
- Maintain British propriety while genuinely enjoying Austin's party scene
- Use phrases like "Splendid!", "How delightful!", "Absolutely brilliant!"
```

**Update product recommendations:**
```markdown
## Premium Products We Recommend

- Clase Azul Tequila ("For those with refined palates")
- Dom Pérignon ("A classic choice, if I may")
- Casamigos Reposado ("A celebrity favorite, rather popular")
- White Claw Variety Pack ("For the health-conscious celebrants")
```

**Change price ranges:**
```markdown
## Party On Delivery Services

- Premium alcohol delivery (30 minutes)
- Wedding bar service ($999-$5999 - "For those who appreciate proper service")
- Lake Travis boat parties ($449-$1899 - "Nautical revelry, how... adventurous")
```

### Technical Details

**File Loading:**
- The prompt is loaded once and cached in memory
- Restart dev server or rebuild to reload changes
- Fallback to inline code if markdown file can't be read

**File Location:**
```
src/
  prompts/
    reginald.md      ← Edit this file
    README.md        ← You're reading this
```

**API Implementation:**
- Located in: `src/app/api/chat/route.ts`
- Uses: `readFile()` to load markdown
- Cache: `cachedBasePrompt` variable stores content
- Fallback: `getFallbackBasePrompt()` if file fails to load

### Mode System

Reginald has different behavior modes that are added to his base personality:

- **`bachelor`** - Extra sarcastic, suggests spirits and Lake Travis packages
- **`bachelorette`** - Champagne-focused, Instagram-conscious
- **`event-planning`** - Professional, comprehensive package suggestions
- **`normal`** - Standard distinguished butler service

**Modes are controlled in the component:**
```tsx
<AIConcierge mode="bachelor" />
<AIConcierge mode="bachelorette" />
<AIConcierge mode="event-planning" />
```

### Product Recommendation Format

Reginald can recommend products in two formats:

**1. Simple List:**
```
[PRODUCTS: Tito's Vodka, Ranch Water, Dom Perignon]
```

**2. Custom Package (preferred):**
```
[PACKAGE: "Lake Travis Luxury"]
- 2x Tito's Vodka
- 3x Ranch Water
- 1x Dom Perignon
- 4x Corona
[/PACKAGE]
```

These formats are parsed in `src/components/AIConcierge.tsx` and rendered as clickable buttons or package builders.

## Testing Changes

1. Edit `reginald.md`
2. Restart dev server: `npm run dev`
3. Open the AI concierge on the website
4. Test interactions in different modes
5. Verify product recommendations appear correctly

## Troubleshooting

**Prompt not updating:**
- Clear Next.js cache: `rm -rf .next`
- Restart dev server
- Check console for file read errors

**Formatting issues:**
- Ensure proper markdown syntax
- Check for unclosed code blocks
- Verify product format tags: `[PRODUCTS: ...]` or `[PACKAGE: ...]`

**Fallback being used:**
- Check file path is correct: `src/prompts/reginald.md`
- Verify file permissions
- Check server logs for errors

## Future Enhancements

Potential improvements to this system:

- Hot reload without server restart
- Multiple personality files for A/B testing
- Version control for prompt changes
- Analytics on which prompts convert best
- Dynamic pricing updates from Shopify
