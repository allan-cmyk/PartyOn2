export interface CreativePrompt {
  id: string;
  filename: string;
  usage: string;
  style: 'abstract' | 'texture' | 'pattern' | 'lifestyle' | 'artistic';
  prompt: string;
  description: string;
}

export const creativePrompts: CreativePrompt[] = [
  // ABSTRACT LUXURY TEXTURES
  {
    id: 'gold-liquid-abstract',
    filename: 'gold-liquid-abstract.webp',
    usage: 'Package cards, feature sections',
    style: 'abstract',
    description: 'Liquid gold abstract pattern',
    prompt: `Ultra-high-end abstract photography of liquid gold (#D4AF37) and champagne creating organic flowing patterns, shot with macro lens. Soft bubbles and swirls creating elegant texture. Shallow depth of field with bokeh effects. Luxury aesthetic with subtle gradients from gold to cream. Professional commercial quality suitable for overlay backgrounds. No text or logos. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'crystal-ice-texture',
    filename: 'crystal-ice-texture.webp',
    usage: 'Cocktail sections, cold drinks',
    style: 'texture',
    description: 'Premium ice crystal texture',
    prompt: `Macro photography of premium crystal-clear ice with gold light refracting through, creating elegant prismatic effects. Ultra-sharp details of ice crystals and subtle gold (#D4AF37) highlights. Luxury bar ice with perfect clarity. Soft gradient from white to pale gold. Professional texture suitable for subtle backgrounds. Commercial quality with artistic composition. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'whiskey-amber-swirl',
    filename: 'whiskey-amber-swirl.webp',
    usage: 'Spirits sections, premium packages',
    style: 'abstract',
    description: 'Whiskey swirl abstract',
    prompt: `Artistic macro photography of premium whiskey swirling in crystal glass, creating abstract amber and gold patterns. Soft light through liquid creating organic shapes. Rich amber tones with gold (#D4AF37) highlights. Shallow depth creating dreamy bokeh. Ultra-luxurious feel suitable for subtle overlay. No identifiable brands or text. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  
  // LUXURY PATTERNS
  {
    id: 'marble-gold-veins',
    filename: 'marble-gold-veins.webp',
    usage: 'Premium sections, headers',
    style: 'pattern',
    description: 'Marble with gold veining',
    prompt: `Professional photography of white Calacatta marble with natural gold veining (#D4AF37), shot with perfect lighting to highlight texture. Subtle, elegant pattern with organic gold lines through pristine white stone. Soft shadows emphasizing depth. Luxury material suitable for backgrounds. Ultra-high resolution showing fine details. Commercial quality for premium branding. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'champagne-bubbles-bokeh',
    filename: 'champagne-bubbles-bokeh.webp',
    usage: 'Celebration sections, party packages',
    style: 'artistic',
    description: 'Champagne bubbles with bokeh',
    prompt: `Artistic macro photography of champagne bubbles rising through golden liquid, shot with extreme shallow depth creating dreamy bokeh spheres. Gold and cream tones (#D4AF37) with soft light creating ethereal atmosphere. Abstract enough for subtle background use. Premium celebration feeling. Professional quality with artistic composition. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  
  // LIFESTYLE DETAILS
  {
    id: 'sunset-water-reflection',
    filename: 'sunset-water-reflection.webp',
    usage: 'Lake packages, boat parties',
    style: 'lifestyle',
    description: 'Golden sunset on water',
    prompt: `Abstract photography of golden sunset reflecting on calm Lake Travis water, creating rippling gold patterns (#D4AF37). Soft, dreamy atmosphere with bokeh effects. No boats or people, just pure water texture with golden light. Subtle enough for background overlay. Premium lifestyle feeling. Professional quality suitable for luxury branding. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'crystal-glassware-light',
    filename: 'crystal-glassware-light.webp',
    usage: 'Service cards, premium packages',
    style: 'artistic',
    description: 'Crystal glass with light patterns',
    prompt: `Artistic photography of light refracting through premium crystal glassware, creating abstract patterns of light and shadow. Gold accents (#D4AF37) from warm lighting. Soft focus with sharp light rays. Elegant composition suitable for subtle backgrounds. Luxury bar aesthetic. Professional commercial quality. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'leather-gold-texture',
    filename: 'leather-gold-texture.webp',
    usage: 'VIP sections, exclusive packages',
    style: 'texture',
    description: 'Luxury leather with gold accents',
    prompt: `Close-up photography of premium cognac leather with subtle gold embossing (#D4AF37), showing rich texture and craftsmanship. Soft lighting emphasizing texture without harsh shadows. Luxury material suggesting exclusivity. Suitable for subtle background patterns. Professional product photography quality. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  
  // BOTANICAL LUXURY
  {
    id: 'gold-botanical-silhouette',
    filename: 'gold-botanical-silhouette.webp',
    usage: 'Organic sections, natural luxury',
    style: 'pattern',
    description: 'Botanical silhouettes in gold',
    prompt: `Elegant photography of botanical herbs and garnishes (rosemary, lavender) backlit to create gold silhouettes (#D4AF37) against cream background. Soft, artistic composition with negative space. Premium cocktail garnish aesthetic. Subtle pattern suitable for overlays. Professional quality with luxury feeling. 16:9 aspect ratio, 2912x1632 resolution.`
  },
  {
    id: 'wine-stain-abstract',
    filename: 'wine-stain-abstract.webp',
    usage: 'Wine sections, artistic accents',
    style: 'abstract',
    description: 'Wine stain artistic pattern',
    prompt: `Artistic photography of red wine creating organic stain patterns on white surface, with gold light (#D4AF37) creating highlights. Abstract watercolor-like effect. Sophisticated and artistic without being messy. Subtle enough for background use. Luxury wine aesthetic. Professional quality suitable for premium branding. 16:9 aspect ratio, 2912x1632 resolution.`
  }
];

export function getCreativeByStyle(style: CreativePrompt['style']): CreativePrompt[] {
  return creativePrompts.filter(p => p.style === style);
}

export function getCreativeByUsage(usage: string): CreativePrompt[] {
  return creativePrompts.filter(p => p.usage.toLowerCase().includes(usage.toLowerCase()));
}