#!/usr/bin/env node
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const apiKey = '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';

// Bach Party Add-ons
const bachAddons = [
  {
    id: 'party-bus-bar',
    filename: 'party-bus-bar.webp',
    dir: 'addons',
    prompt: `Generate a luxurious party bus interior with a built-in bar, LED lighting, plush leather seats, and premium spirits displayed. Show champagne bottles in ice buckets, cocktail glasses, and a professional bartender preparing drinks. Vibrant party atmosphere with neon accent lighting. Professional interior photography, ultra high resolution.`
  },
  {
    id: 'private-mixologist',
    filename: 'private-mixologist.webp',
    dir: 'addons',
    prompt: `Create an image of a professional mixologist in formal attire crafting artisanal cocktails at an elegant bar setup. Show premium spirits, fresh garnishes, cocktail shakers, and specialty glassware. The mixologist should be mid-pour creating a signature cocktail. Upscale event atmosphere, professional photography, ultra high resolution.`
  },
  {
    id: 'champagne-tower',
    filename: 'champagne-tower.webp',
    dir: 'addons',
    prompt: `Generate a stunning champagne tower pyramid with crystal coupe glasses stacked elegantly, champagne being poured from the top cascading down. Golden lighting highlighting the bubbles and glass. Celebration atmosphere with bokeh lights in background. Luxury event photography, ultra high resolution.`
  },
  {
    id: 'recovery-brunch',
    filename: 'recovery-brunch.webp',
    dir: 'addons',
    prompt: `Create an elegant brunch spread with mimosas, bloody marys, fresh pastries, fruit platters, and gourmet breakfast items on a beautifully set table. Include champagne bottles, fresh orange juice, and coffee service. Bright, airy atmosphere with natural light. Lifestyle photography, ultra high resolution.`
  }
];

// Lake Travis Locations
const lakeTravisLocations = [
  {
    id: 'the-oasis',
    filename: 'the-oasis-sunset.webp',
    dir: 'lake-travis',
    prompt: `Generate a breathtaking sunset view from The Oasis restaurant on Lake Travis, Austin. Show the multi-level outdoor decks with diners, the expansive lake view, and the famous Texas sunset with orange and purple sky. Include boats on the water and hills in the distance. Professional landscape photography at golden hour, ultra high resolution.`
  },
  {
    id: 'devils-cove',
    filename: 'devils-cove-party.webp',
    dir: 'lake-travis',
    prompt: `Create a vibrant scene of Devil's Cove on Lake Travis with multiple boats anchored together, people swimming and partying, floating mats, and crystal blue water. Show party atmosphere with music, drinks, and water activities. Bright sunny day, aerial perspective, professional marine photography, ultra high resolution.`
  },
  {
    id: 'volente-beach',
    filename: 'volente-beach.webp',
    dir: 'lake-travis',
    prompt: `Generate a family-friendly beach scene at Volente Beach on Lake Travis. Show sandy beach area, water slides in background, families with coolers and umbrellas, calm water, and boats anchored nearby. Bright daylight, cheerful atmosphere, lifestyle photography, ultra high resolution.`
  },
  {
    id: 'hudson-bend',
    filename: 'hudson-bend-quiet.webp',
    dir: 'lake-travis',
    prompt: `Create a serene, quiet cove scene at Hudson Bend on Lake Travis. Show calm water, tree-lined shores, a few luxury boats anchored peacefully, and Texas Hill Country landscape. Tranquil atmosphere with soft morning light. Nature photography style, ultra high resolution.`
  },
  {
    id: 'lakeway-marina',
    filename: 'lakeway-marina.webp',
    dir: 'lake-travis',
    prompt: `Generate a professional marina scene at Lakeway Marina on Lake Travis. Show boat slips, luxury yachts, the marina store, fuel dock, and well-maintained facilities. Include staff helping with boat preparations. Clear day, professional architectural photography, ultra high resolution.`
  },
  {
    id: 'point-venture',
    filename: 'point-venture.webp',
    dir: 'lake-travis',
    prompt: `Create an exclusive, upscale lakefront community scene at Point Venture on Lake Travis. Show luxury homes with private docks, pristine boats, manicured landscapes, and quiet cove waters. Elegant, private atmosphere with golden hour lighting. Real estate photography style, ultra high resolution.`
  }
];

// Wedding Service Types
const weddingServices = [
  {
    id: 'cocktail-hour',
    filename: 'cocktail-hour-service.webp',
    dir: 'wedding-services',
    prompt: `Generate an elegant outdoor wedding cocktail hour with guests in formal attire mingling, professional bartenders at a sophisticated bar setup, signature cocktails being served on silver trays. Garden or terrace setting with string lights. Upscale wedding photography, ultra high resolution.`
  },
  {
    id: 'reception-bar',
    filename: 'reception-bar.webp',
    dir: 'wedding-services',
    prompt: `Create a luxurious wedding reception bar setup with gold accents, premium spirits display, floral arrangements, and bartenders in formal attire. Show elegant glassware, champagne on ice, and wedding decor. Indoor ballroom setting, professional event photography, ultra high resolution.`
  }
];

// Corporate Event Types
const corporateServices = [
  {
    id: 'networking-mixer',
    filename: 'networking-mixer.webp',
    dir: 'corporate',
    prompt: `Generate a professional networking event with business professionals in suits holding cocktails, mingling in a modern office space or rooftop venue. Show a sleek bar setup with professional bartender. Austin skyline visible. Corporate event photography, ultra high resolution.`
  },
  {
    id: 'product-launch',
    filename: 'product-launch.webp',
    dir: 'corporate',
    prompt: `Create a high-tech product launch event with branded bar setup, LED lighting, modern venue, professionals networking with drinks. Show presentation screens, branded cocktails, and excited attendees. Professional event photography, ultra high resolution.`
  }
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateImage(item: any) {
  console.log(`\n🎨 Generating: ${item.id}`);
  console.log(`   Directory: ${item.dir}`);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Contextual Images'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: item.prompt
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

    // Create directory if needed
    const outputDir = path.join('public/images', item.dir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const pngPath = path.join(outputDir, item.filename.replace('.webp', '.png'));
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(pngPath, buffer);

    // Create optimized WebP
    const webpPath = path.join(outputDir, item.filename);
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

async function generateAllContextualImages() {
  console.log('🎨 Generating ALL Contextual Images for PartyOn');
  console.log('==============================================');
  
  const allImages = [
    ...bachAddons,
    ...lakeTravisLocations,
    ...weddingServices,
    ...corporateServices
  ];

  console.log(`Total images to generate: ${allImages.length}`);

  for (const image of allImages) {
    await generateImage(image);
    
    if (allImages.indexOf(image) < allImages.length - 1) {
      console.log('   ⏳ Waiting 2s...');
      await sleep(2000);
    }
  }

  console.log('\n✅ All contextual images generated!');
  console.log('Now updating pages to use these images...');
}

generateAllContextualImages();