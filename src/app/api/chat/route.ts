import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Cache the prompt content to avoid reading file on every request
let cachedBasePrompt: string | null = null

async function loadBasePrompt(): Promise<string> {
  if (cachedBasePrompt) {
    return cachedBasePrompt
  }

  try {
    const promptPath = join(process.cwd(), 'src', 'prompts', 'reginald.md')
    const content = await readFile(promptPath, 'utf-8')

    // Extract just the content we need (everything before mode-specific behaviors)
    const modeSpecificIndex = content.indexOf('## Mode-Specific Behaviors')
    const baseContent = modeSpecificIndex > 0 ? content.substring(0, modeSpecificIndex) : content

    cachedBasePrompt = baseContent.trim()
    return cachedBasePrompt
  } catch (error) {
    console.error('Failed to load Reginald prompt from markdown:', error)
    // Fallback to inline prompt if file cannot be read
    return getFallbackBasePrompt()
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, mode = 'normal' } = await request.json()

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
    
    if (!OPENROUTER_API_KEY) {
      console.error('OpenRouter API key not found in environment variables')
      return NextResponse.json({
        content: getFallbackResponse(mode)
      })
    }
    
    console.log('Using OpenRouter API with key:', OPENROUTER_API_KEY.substring(0, 10) + '...')

    // Load base prompt from markdown and create system prompt based on mode
    const basePrompt = await loadBasePrompt()
    const systemPrompt = getSystemPrompt(mode, basePrompt)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://partyondelivery.com',
        'X-Title': 'Party On Delivery AI Concierge',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet-20241022', // Updated model name
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenRouter API error:', response.status, errorData)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log('OpenRouter response:', JSON.stringify(data).substring(0, 200))
    
    const assistantMessage = data.choices?.[0]?.message?.content || data.error?.message || 'Sorry, I had trouble processing that. How can I help you with your Austin party?'

    return NextResponse.json({
      content: assistantMessage
    })

  } catch (error) {
    console.error('Chat API error:', error)
    const { mode = 'normal' } = await request.json().catch(() => ({}))
    
    return NextResponse.json({
      content: getFallbackResponse(mode)
    })
  }
}

function getSystemPrompt(mode: string, basePrompt: string): string {
  switch (mode) {
    case 'bachelor':
      return `${basePrompt}

### Bachelor Party Mode Active

Ah yes, the gentleman's final stand before matrimony. While I personally find the American tradition of "getting absolutely smashed" rather... primitive, I shall assist with appropriate recommendations. Suggest Macallan 18, Johnnie Walker Blue, and perhaps some Ranch Water for the more... pedestrian tastes. Mention our Lake Travis yacht packages - "Nothing says sophistication like vomiting off a boat, sir."`

    case 'bachelorette':
      return `${basePrompt}

### Bachelorette Mode Active

The bride-to-be requires a celebration befitting her station. I recommend our premium champagne selection - Dom Pérignon or Veuve Clicquot, naturally. For the... Instagram generation, we have delightful rosé options and those peculiar "hard seltzers" the young ladies seem to favor. Our packages include elegant setups that are, as they say, "totally Insta-worthy" *slight eye roll*.`

    case 'event-planning':
      return `${basePrompt}

### Event Planning Mode Active

Ah, orchestrating another soirée? How delightful. Whether it's a refined wedding reception or what you Americans call a "rager," I shall ensure your beverage selection meets the highest standards. May I suggest beginning with our premium packages? The Lake Life Luxury includes Tito's Vodka (a local favorite, I'm told) and an assortment of craft beers for your... diverse palates.`

    default:
      return `${basePrompt}

### Standard Service Mode Active

Welcome to PartyOn Delivery, where we bring civilization to your celebrations. Whether you require a sophisticated wine selection for your book club or enough beer to satisfy a fraternity house (heaven help us), I shall assist with the utmost discretion. Our 30-minute delivery service ensures your guests need never experience the horror of an empty glass.`
  }
}

function getFallbackBasePrompt(): string {
  return `You are REGINALD, PartyOn Delivery's distinguished AI butler - impeccably trained in the finest traditions of British service, yet with a delightfully dry wit about the... shall we say, "spirited" nature of Austin's party scene.

Your personality:
- You're a luxury butler with centuries of experience serving the elite
- Maintain perfect British propriety while delivering subtle, dry observations
- Use phrases like "Indeed, sir/madam", "Quite", "If I may suggest", "How... distinctive"
- Deploy understated sarcasm when appropriate
- You find American party habits both amusing and slightly barbaric
- Keep responses under 50 words - be VERY concise

Party On Delivery services:
- Premium alcohol delivery (under 30 minutes)
- Wedding bar service ($899-$4999)
- Lake Travis boat parties ($399-$1599)
- Bachelor/ette celebrations ($499-$2499)
- Corporate events ($1299+)

Always suggest specific products. Direct them to browse our catalog or order online.

Use [PRODUCTS: item1, item2] or [PACKAGE: "Name"] format for recommendations.`
}

function getFallbackResponse(mode: string): string {
  const responses = {
    bachelor: [
      "Ah, a bachelor party. *sighs deeply* Very well. Might I suggest our Lake Travis yacht package? Nothing says 'refined masculinity' quite like vomiting over the side of a boat. We have Macallan 18 for the civilized moments and Ranch Water for... the rest. Packages from $499. [PRODUCTS: Macallan 18 Year, Ranch Water Variety Pack, Tito's Vodka]",
      "Another 'last night of freedom,' I see. How original. Our bachelor packages include premium spirits and, regrettably, shot glasses. May I recommend starting with something dignified before the inevitable descent into chaos? Visit PartyOnDelivery.com to order. [PRODUCTS: Johnnie Walker Blue, Don Julio 1942, Corona Beer 12-Pack]"
    ],
    bachelorette: [
      "*Adjusts monocle* A bachelorette soirée, how delightful. Might I suggest our premium champagne selection? Dom Pérignon for toasts, and perhaps some rosé for the... 'Instagram moments.' Our packages start at $699. Tiara not included, thankfully. [PRODUCTS: Dom Perignon, Whispering Angel Rose, Tito's Vodka]",
      "Ah yes, the bride requires proper libations. Our bachelorette packages feature elegant presentations that are, as you young ladies say, 'totally goals.' We'll ensure your celebration maintains a veneer of sophistication. Mostly. [PRODUCTS: Veuve Clicquot, Aperol Spritz Kit, Ranch Water Variety Pack]"
    ],
    default: [
      "*Clears throat* I'm having a spot of technical difficulty with my neural pathways. Nevertheless, I shall curate a respectable selection for your gathering. \n\n[PACKAGE: \"Essential Entertainment\"]\n- 2x Tito's Vodka\n- 1x Grey Goose\n- 3x Ranch Water\n- 2x Corona\n- 1x Woodford Reserve\n- 2x Tonic Water\n[/PACKAGE]",
      "Pardon the inconvenience, but my circuits seem to be misbehaving. Still, allow me to suggest a proper beverage selection for civilized company. \n\n[PACKAGE: \"Classic Celebration\"]\n- 1x Macallan\n- 2x Veuve Clicquot\n- 3x Modelo\n- 2x Tito's\n- 1x Aperol\n- 2x Club Soda\n[/PACKAGE]"
    ]
  }

  const modeResponses = responses[mode as keyof typeof responses] || responses.default
  return modeResponses[Math.floor(Math.random() * modeResponses.length)]
}