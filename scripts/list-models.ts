#!/usr/bin/env node

async function listModels() {
  const apiKey = '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';
  
  console.log('📋 Fetching available models from OpenRouter...\n');

  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://party-on-delivery.vercel.app',
        'X-Title': 'PartyOn Delivery'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    
    // Filter for image generation models or Gemini models
    const imageModels = data.data.filter((model: any) => 
      model.id.toLowerCase().includes('image') || 
      model.id.toLowerCase().includes('gemini') ||
      model.name?.toLowerCase().includes('image')
    );

    console.log('🖼️  Image Generation Models:');
    console.log('============================\n');
    
    imageModels.forEach((model: any) => {
      console.log(`ID: ${model.id}`);
      console.log(`Name: ${model.name || 'N/A'}`);
      console.log(`Context: ${model.context_length || 'N/A'}`);
      console.log('---');
    });

    // Also show all Gemini models
    console.log('\n🔷 All Gemini Models:');
    console.log('====================\n');
    
    const geminiModels = data.data.filter((model: any) => 
      model.id.toLowerCase().includes('gemini')
    );
    
    geminiModels.forEach((model: any) => {
      console.log(`ID: ${model.id}`);
      console.log(`Name: ${model.name || 'N/A'}`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listModels();