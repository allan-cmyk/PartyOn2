#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const apiKey = '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';

async function generateEastAustin() {
  console.log('🔧 Fixing East Austin brewery image...');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Fix East Austin'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: `Create a vibrant photograph of East Austin's brewery and bar district. Show a trendy outdoor beer garden with string lights, picnic tables, colorful food trucks, and people enjoying craft beers. Include industrial-chic converted warehouse buildings with modern brewery signs, some street art murals on brick walls. The scene should capture the hip, creative atmosphere with young professionals socializing. Golden hour lighting creating a warm, inviting atmosphere. Professional lifestyle photography, ultra high resolution, 8K quality.`
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('❌ API Error');
      return false;
    }

    const data = await response.json();
    const message = data.choices[0]?.message;
    let imageData: string | null = null;

    if (message?.images && message.images[0]) {
      const imageUrl = message.images[0].image_url?.url || message.images[0].url;
      if (imageUrl) {
        imageData = imageUrl;
      }
    }

    if (!imageData || !imageData.startsWith('data:image')) {
      console.error('❌ No image data received');
      // Use a fallback - copy an existing image
      console.log('Using fallback image...');
      const fallbackSrc = 'public/images/services/boat-parties/luxury-yacht-deck.webp';
      const destPath = 'public/images/destinations/east-austin-brewery.webp';
      
      if (fs.existsSync(fallbackSrc)) {
        fs.copyFileSync(fallbackSrc, destPath);
        console.log('✅ Created fallback: ' + destPath);
      }
      return false;
    }

    // Save the generated image
    const outputDir = 'public/images/destinations';
    const pngPath = path.join(outputDir, 'east-austin-brewery.png');
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(pngPath, buffer);

    // Create optimized WebP
    const webpPath = path.join(outputDir, 'east-austin-brewery.webp');
    await sharp(pngPath)
      .resize(1456, 816, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    fs.unlinkSync(pngPath);
    console.log('✅ Created: ' + webpPath);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    // Use fallback
    const fallbackSrc = 'public/images/services/boat-parties/luxury-yacht-deck.webp';
    const destPath = 'public/images/destinations/east-austin-brewery.webp';
    
    if (fs.existsSync(fallbackSrc)) {
      fs.copyFileSync(fallbackSrc, destPath);
      console.log('✅ Created fallback: ' + destPath);
    }
    return false;
  }
}

generateEastAustin();