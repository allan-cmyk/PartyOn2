#!/usr/bin/env node
import 'dotenv/config';

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
  }

  console.log('🔧 Testing Gemini 2.5 Flash Image Preview API');
  console.log('API Key:', apiKey.substring(0, 20) + '...');
  console.log('');

  const testPrompt = `Ultra-photorealistic commercial photography of the Austin Texas skyline during golden hour, featuring the iconic State Capitol dome and Frost Bank Tower. Professional quality, 16:9 aspect ratio.`;

  try {
    console.log('📡 Sending test request to OpenRouter...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Delivery Test'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: testPrompt
          }
        ]
      })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response received');
    console.log('Response structure:', JSON.stringify(data, null, 2));

    if (data.choices && data.choices[0]?.message?.content) {
      console.log('\n📸 Image generation successful!');
      console.log('Content preview:', data.choices[0].message.content.substring(0, 200) + '...');
      
      // Check if it's a URL or base64
      const content = data.choices[0].message.content;
      if (content.includes('http')) {
        console.log('📎 Image URL detected');
      } else if (content.includes('data:image')) {
        console.log('📎 Base64 image detected');
      } else {
        console.log('📎 Response format:', content.substring(0, 50));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testGeminiAPI();