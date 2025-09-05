#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const apiKey = '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';

const austinDestinations = [
  {
    id: 'rainey-street',
    filename: 'rainey-street-nightlife.webp',
    location: 'Rainey Street',
    prompt: `Generate a photorealistic twilight photograph of Rainey Street in Austin, Texas. Show the distinctive historic bungalows converted into bars with string lights overhead, colorful neon signs, and crowds of well-dressed people socializing on outdoor patios. Include food trucks in the background and the Austin skyline visible in the distance. Golden hour lighting with vibrant nightlife atmosphere. Professional architectural photography style, ultra high resolution, 8K quality.`
  },
  {
    id: '6th-street',
    filename: '6th-street-entertainment.webp',
    location: '6th Street',
    prompt: `Create a dynamic nighttime photograph of Austin's famous 6th Street entertainment district. Show the historic buildings with neon bar signs, live music venues with people queuing outside, street musicians performing, and crowds of party-goers walking along the sidewalks. Include the distinctive old-fashioned street lamps and Texas flags. Vibrant nightlife photography with bokeh lights, professional street photography style, ultra high resolution, 8K quality.`
  },
  {
    id: 'the-domain',
    filename: 'the-domain-upscale.webp',
    location: 'The Domain',
    prompt: `Generate a sophisticated evening photograph of The Domain upscale shopping area in Austin. Show modern architecture with luxury storefronts, elegant outdoor dining patios with string lights, well-dressed shoppers and diners, fountains and landscaped walkways. Include high-end restaurants with outdoor seating and cocktail bars with modern design. Professional commercial photography style with warm lighting, ultra high resolution, 8K quality.`
  },
  {
    id: 'east-austin',
    filename: 'east-austin-brewery.webp',
    location: 'East Austin',
    prompt: `Create a hip, artistic photograph of East Austin's brewery district. Show industrial-chic converted warehouses with craft brewery signs, outdoor beer gardens with picnic tables and string lights, food trucks, murals on brick walls, and young professionals socializing. Include bikes parked outside and the eclectic, creative vibe of the neighborhood. Golden hour lighting, lifestyle photography style, ultra high resolution, 8K quality.`
  },
  {
    id: 'lake-travis',
    filename: 'lake-travis-boats.webp',
    location: 'Lake Travis',
    prompt: `Generate a stunning daytime photograph of Lake Travis party scene. Show luxury boats and yachts anchored together on crystal blue water, people celebrating on boat decks with drinks, floating party platforms, jet skis, and the beautiful Texas Hill Country in the background. Include party coves with multiple boats rafted together. Bright sunny day, aerial perspective, professional marine photography, ultra high resolution, 8K quality.`
  },
  {
    id: 'hill-country',
    filename: 'hill-country-winery.webp',
    location: 'Hill Country',
    prompt: `Create an elegant photograph of a Texas Hill Country winery at golden hour. Show rolling hills with vineyards, a rustic-elegant tasting room with stone architecture, outdoor terraces with wine barrels as tables, string lights in oak trees, and well-dressed guests enjoying wine. Include the characteristic Texas limestone buildings and panoramic hill views. Professional architectural and landscape photography, warm sunset lighting, ultra high resolution, 8K quality.`
  }
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateDestinationImage(destination: any) {
  console.log(`\n📍 Generating: ${destination.location}`);
  console.log(`   File: ${destination.filename}`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Austin Destinations'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: destination.prompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('   ❌ API Error');
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
      console.error('   ❌ No image data');
      return false;
    }

    // Save to destinations directory
    const outputDir = 'public/images/destinations';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pngPath = path.join(outputDir, destination.filename.replace('.webp', '.png'));
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(pngPath, buffer);

    // Create optimized WebP
    const webpPath = path.join(outputDir, destination.filename);
    await sharp(pngPath)
      .resize(1456, 816, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    fs.unlinkSync(pngPath);
    console.log(`   ✅ Created: ${webpPath}`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error:`, error);
    return false;
  }
}

async function generateAustinDestinations() {
  console.log('📍 Austin Destination Images Generation');
  console.log('=======================================');
  
  for (const destination of austinDestinations) {
    await generateDestinationImage(destination);
    
    if (austinDestinations.indexOf(destination) < austinDestinations.length - 1) {
      console.log('   ⏳ Waiting...');
      await sleep(2000);
    }
  }

  console.log('\n✅ Austin destination images generated!');
  console.log('Now updating the bach-parties page to use these context-specific images');
}

generateAustinDestinations();