# IMAGE GENERATION DOCUMENTATION
## OpenRouter Gemini 2.5 Flash Image Preview Integration

### Overview
This document captures our successful approaches for generating world-class presentation slides using OpenRouter's Gemini 2.5 Flash Image Preview API. We've developed two distinct visual styles that can be applied to any lesson content.

---

## 🎯 Core API Configuration

### Model Details
- **Model Name**: `google/gemini-2.5-flash-image-preview`
- **Provider**: OpenRouter
- **Pricing**: $30.00 per 1M output tokens (~$0.039 per image)
- **Token Limit**: 32,768 tokens maximum (important!)

### API Setup
```javascript
const baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
const apiKey = 'sk-or-v1-YOUR_API_KEY_HERE';

// Critical: Use 30,000 max tokens (not 150,000!)
const apiConfig = {
    model: 'google/gemini-2.5-flash-image-preview',
    temperature: 0.7,
    max_tokens: 30000,  // DO NOT EXCEED 32,768
    modalities: ["image", "text"]
};
```

### Image Extraction Pattern
```javascript
// Images come in the message.images array as base64
if (message.images && message.images.length > 0) {
    const image = message.images[0];
    const imageUrl = image.image_url.url;
    
    if (imageUrl.startsWith('data:image')) {
        const base64Match = imageUrl.match(/data:image\/(\w+);base64,(.+)/);
        const buffer = Buffer.from(base64Match[2], 'base64');
        await fs.writeFile(imagePath, buffer);
    }
}
```

---

## 📸 Style 1: PHOTOREALISTIC WORLD-CLASS

### Key Characteristics
- Ultra-high-quality photorealistic imagery
- Professional photography specifications
- Magazine-quality layouts
- Embedded typography (not separate text overlay)
- CEO-level executive aesthetic

### Prompt Engineering Template
```javascript
createPhotorealisticPrompt(slideConfig) {
    return `Create an ULTRA-HIGH-QUALITY, PHOTOREALISTIC presentation slide.
    
    PHOTOGRAPHIC SPECIFICATIONS:
    - Camera: Shot with Hasselblad H6D-100c, 100 megapixel sensor
    - Lens: 80mm f/2.8 for perfect portrait compression
    - Lighting: Professional studio setup with key light, fill light, and rim lighting
    - Style: Annie Leibovitz portrait photography meets Architectural Digest
    - Post-processing: Subtle color grading, professional retouching
    
    TYPOGRAPHY (EMBEDDED IN IMAGE):
    - ${slideConfig.title}
    - ${slideConfig.subtitle}
    - Font: Modern, clean sans-serif embedded directly in the image
    - Layout: Magazine-quality design with perfect visual hierarchy
    
    VISUAL AESTHETICS:
    - Bright, optimistic, solution-focused imagery
    - Warm, inviting color palette
    - Professional models in authentic situations
    - Natural expressions showing confidence and peace
    
    BRAND REFERENCES:
    - Apple product photography clarity
    - Vogue magazine layouts
    - TED Talk presentation aesthetics
    - Harvard Business Review visual style`;
}
```

### Transformation Approach
Each lesson gets a unique transformation from problem to solution:

| Lesson | Original Theme | Transformed Theme | Visual Style |
|--------|---------------|-------------------|--------------|
| Lesson 1 | Anxiety understanding | Hope & empowerment | Golden hour, uplifting |
| Lesson 2 | Physical symptoms | Healing & relief | Spa-like serenity |
| Lesson 3 | Sleep struggles | Sleep sanctuary | Four Seasons hotel luxury |
| Lesson 4 | Anxiety profiling | CEO-level mastery | Executive boardroom confidence |

### Output Structure
```
/public/complete-lesson-world-class/
├── lesson-1-with-text/
│   ├── slide-01.png
│   ├── slide-02.png
│   └── ... (24 slides)
├── lesson-2-with-text/
│   └── ... (33 slides)
├── lesson-3-with-text/
│   └── ... (24 slides)
└── lesson-4-with-text/
    └── ... (21 slides)
```

---

## 🎨 Style 2: ANIMATED/ILLUSTRATED WARM STYLE

### Key Characteristics
- Soft watercolor/animated aesthetic
- Children's book illustration quality
- Warm, comforting color palettes
- Hand-drawn, organic feel
- Gentle, dreamy atmosphere

### Prompt Engineering Template
```javascript
createAnimatedPrompt(slideNumber, title, text) {
    const baseStyle = `Create a warm, illustrated presentation slide in a soft animated/watercolor style.
    
    ARTISTIC STYLE:
    - Soft watercolor textures and gradients
    - Warm golden hour lighting (peach, coral, warm yellows, soft purples)
    - Hand-drawn illustration style, NOT photorealistic
    - Gentle, flowing lines and organic shapes
    - Similar to modern children's book illustrations
    
    TEXT INTEGRATION (CRITICAL):
    - Include exact text overlaid on the illustration
    - Use elegant, readable typography that feels hand-lettered
    - Text must be clearly visible with proper contrast
    - Integrate text as part of the artistic composition
    
    ATMOSPHERE:
    - Comforting and hopeful
    - Soft, dreamy quality
    - Warm color temperature
    - Simplified, friendly character features`;
    
    return baseStyle + specificSlideContent;
}
```

### Color Palette
- Primary: Warm sunset tones (peach, coral, golden)
- Secondary: Soft purples, lavenders
- Accent: Gentle greens, sky blues
- Base: Cream, warm whites

### Reference Style Examples
Based on these reference images:
- Soft gradient backgrounds
- Watercolor-like textures
- Simplified character illustrations
- Integrated typography that feels artistic
- Warm, hopeful atmosphere throughout

---

## 🚀 Implementation Guide

### Step 1: Parse Source Content
```javascript
// Read enhanced markdown prompts
const enhancedPrompts = await fs.readFile(
    `bloom-course-content/courses/anxiety-management/weeks/
     week-1-anxious-brain/lesson-X/enhanced-canva-prompts.md`
);

// Parse into slide configurations
const slides = parseMarkdownToSlides(enhancedPrompts);
```

### Step 2: Transform Content
```javascript
// Apply positive transformation
function transformToSolutionFocused(originalPrompt) {
    return originalPrompt
        .replace(/anxiety/gi, 'calm confidence')
        .replace(/worry/gi, 'peaceful awareness')
        .replace(/struggle/gi, 'growth opportunity')
        // ... more transformations
}
```

### Step 3: Generate Images
```javascript
class SlideGenerator {
    async generateSlide(slideNumber) {
        const prompt = this.createPrompt(slideNumber);
        
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash-image-preview',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 30000, // CRITICAL: Don't exceed!
                modalities: ["image", "text"]
            })
        });
        
        // Extract and save image...
    }
}
```

### Step 4: Rate Limiting
```javascript
// Add 2-second delay between requests
if (i < totalSlides) {
    await new Promise(resolve => setTimeout(resolve, 2000));
}
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Token Limit Exceeded
**Error**: "This endpoint's maximum context length is 32768 tokens"
**Solution**: Set max_tokens to 30000 (not 150000)

### Issue 2: No Images Generated
**Problem**: API returns success but no images
**Check**: Look for images in `message.images` array, not in content

### Issue 3: API Authentication
**Error**: "User not found" (401)
**Solution**: Verify API key is valid and active

### Issue 4: Text Not Embedded
**Problem**: Images generate without text
**Solution**: Be explicit about embedding text IN the image, not as overlay

---

## 📋 Checklist for New Lessons

When creating images for a new lesson:

- [ ] Locate the enhanced-canva-prompts.md file for the lesson
- [ ] Choose style: Photorealistic or Animated
- [ ] Create transformation theme (problem → solution)
- [ ] Set up generator script with correct paths
- [ ] Use API key: `sk-or-v1-...` (get latest from env)
- [ ] Set max_tokens to 30000 (not 150000!)
- [ ] Include 2-second rate limiting between calls
- [ ] Verify output directory exists
- [ ] Test with first slide before running full batch

---

## 📂 File Structure

```
/scripts/
├── generate-lesson1-world-class.js      # Photorealistic Lesson 1
├── generate-lesson2-world-class.js      # Photorealistic Lesson 2
├── generate-lesson3-world-class.js      # Photorealistic Lesson 3
├── generate-lesson4-world-class.js      # Photorealistic Lesson 4
├── generate-lesson1-animated-style.js   # Animated style Lesson 1
└── generate-[lesson]-[style].js        # Future lessons

/public/
├── complete-lesson-world-class/         # Photorealistic outputs
│   └── lesson-X-with-text/
└── lesson1-animated-style/              # Animated style outputs
```

---

## 🎯 Quality Standards

### Photorealistic Style Must Have:
- Professional photography quality
- Clear embedded typography
- Magazine-quality layout
- Bright, solution-focused imagery
- Executive/CEO aesthetic

### Animated Style Must Have:
- Warm watercolor textures
- Soft, comforting atmosphere
- Hand-drawn illustration feel
- Integrated artistic typography
- Golden hour color palette

---

## 🔄 Next Steps for Remaining Lessons

### Week 1 Remaining:
- Lesson 5: "Building Your Support System"
- Lesson 6: "Your Personal Anxiety Toolkit"

### Week 2 (Self-Compassion):
- 5 lessons to generate
- Focus on warmth, self-care visuals

### Weeks 3-6:
- To be developed
- Apply same transformation principles

---

## 💡 Key Learnings

1. **Token limits are critical** - Never exceed 30,000 for this model
2. **Text must be explicitly embedded** - Not added as separate overlay
3. **Transformation matters** - Always shift from problem to solution focus
4. **Style consistency** - Maintain chosen aesthetic throughout lesson
5. **Rate limiting required** - 2 seconds between API calls minimum
6. **Base64 extraction** - Images come in specific format in response

---

## 📞 Support & Updates

- Model: `google/gemini-2.5-flash-image-preview`
- Provider: OpenRouter
- Documentation: https://openrouter.ai/docs
- Pricing: $0.039 per image (approximately)

Last Updated: January 2025
Generated Successfully: Lessons 1-4 (102 total slides)