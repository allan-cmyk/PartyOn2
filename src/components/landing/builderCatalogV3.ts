// Curated product catalog for the package builder modal.
// Source: Party On Delivery's actual Shopify inventory
// (see /shopify_inventory_2025-08-26.csv for the full source).
//
// Categories per spec:
//   - Light Beer (10) and Craft Beer (10)
//   - Seltzers (10)
//   - Whiskey (5), Tequila (5), Vodka (5), Gin (3), Rum (3)
//   - Cocktail Kits (10) — first 10 from the cocktail-kits collection
//   - Sodas & Sparkling Waters
//   - Cups, Ice, Ping-pong & Party Supplies
//
// Names and prices are pulled from the live inventory.
// Image paths point to real photos in /public/images/products/ where
// they exist; otherwise the card falls back to the emoji + brand-color tile.
//
// Some folder paths contain spaces and a "•" character — Next/Image
// handles these when passed through encodeURI() at render time.

export type BuilderProduct = {
  id: string;
  name: string;
  detail?: string;
  price: number;
  emoji: string;
  accent: string;
  image?: string;
};

export type BuilderCategory = {
  key: string;
  label: string;
  products: BuilderProduct[];
};

const P = '/images/products';

// ---------- STEP 1: BEER & SELTZERS ----------

// LIGHT BEER (10)
export const lightBeers: BuilderProduct[] = [
  { id: 'lb-coorslight', name: 'Coors Light', detail: '12-pack 12oz can', price: 15.99, emoji: '🍺', accent: 'bg-sky-400' },
  { id: 'lb-corona-extra', name: 'Corona Extra', detail: '24-pack 12oz can', price: 36.99, emoji: '🍺', accent: 'bg-yellow-400' },
  { id: 'lb-corona-light', name: 'Corona Light', detail: '18-pack 12oz can', price: 24.99, emoji: '🍺', accent: 'bg-yellow-300' },
  { id: 'lb-modelo', name: 'Modelo Especial', detail: '24-pack 12oz can', price: 33.99, emoji: '🍻', accent: 'bg-yellow-600' },
  { id: 'lb-modelo-chelada', name: 'Modelo Chelada Limon y Sal', detail: '12-pack 12oz can', price: 19.99, emoji: '🍋', accent: 'bg-amber-600' },
  { id: 'lb-lonestar', name: 'Lone Star', detail: '12-pack 12oz can', price: 13.99, emoji: '🍺', accent: 'bg-amber-700' },
  { id: 'lb-michelob-ultra', name: 'Michelob Ultra', detail: '25oz can', price: 3.49, emoji: '🍺', accent: 'bg-blue-500' },
  { id: 'lb-karbach-blonde', name: 'Karbach Love Street Blonde', detail: '18-pack 12oz can', price: 26.99, emoji: '🍺', accent: 'bg-amber-300' },
  { id: 'lb-native-pilsner', name: 'Native Texan Pilsner', detail: '6-pack 12oz can', price: 11.99, emoji: '🍺', accent: 'bg-yellow-500' },
  { id: 'lb-tx-blonde', name: 'Texas Beer Co. Local Blonde', detail: '24-pack 12oz can', price: 38.99, emoji: '🍺', accent: 'bg-amber-400' },
];

// CRAFT BEER (10)
export const craftBeers: BuilderProduct[] = [
  { id: 'cb-aw-peacemaker', name: 'Austin Beerworks Peacemaker', detail: '6-pack 12oz can', price: 11.99, emoji: '🍺', accent: 'bg-amber-500', image: `${P}/austin-beerworks-anytime-ale-keg.jpg` },
  { id: 'cb-aw-pearlsnap', name: 'Austin Beerworks Pearl Snap', detail: '6-pack 12oz can', price: 11.99, emoji: '🍺', accent: 'bg-amber-400', image: `${P}/austin-beerworks-anytime-ale-keg.jpg` },
  { id: 'cb-aw-fireeagle', name: 'Austin Beerworks Fire Eagle', detail: '6-pack 12oz can', price: 11.99, emoji: '🦅', accent: 'bg-orange-500' },
  { id: 'cb-aw-variety', name: 'Austin Beerworks Variety Pack', detail: '12-pack 12oz can', price: 22.99, emoji: '🍻', accent: 'bg-orange-400' },
  { id: 'cb-lagunitas-ipa', name: 'Lagunitas IPA', detail: '12-pack 12oz cans', price: 22.99, emoji: '🍺', accent: 'bg-lime-600', image: `${P}/lagunitas-ipa-12-pack.jpg` },
  { id: 'cb-hopadillo', name: 'Karbach Hopadillo IPA', detail: '12-pack 12oz can', price: 30.49, emoji: '🌶️', accent: 'bg-orange-600' },
  { id: 'cb-liveoak-hefe', name: 'Live Oak Hefeweizen', detail: '12-pack 12oz cans', price: 22.99, emoji: '🍺', accent: 'bg-yellow-500' },
  { id: 'cb-real-ale-sampler', name: 'Real Ale Sampler', detail: '12-pack 12oz can', price: 18.99, emoji: '🍻', accent: 'bg-amber-700' },
  { id: 'cb-shiner', name: 'Shiner Bock', detail: '18-pack 12oz can', price: 25.99, emoji: '🐏', accent: 'bg-amber-800' },
  { id: 'cb-zilker-hazy', name: 'Zilker Heavenly Daze Hazy IPA', detail: '6-pack 12oz cans', price: 13.99, emoji: '🌥️', accent: 'bg-yellow-600' },
];

// SELTZERS (10)
export const seltzers: BuilderProduct[] = [
  { id: 's-suncruiser', name: 'Sun Cruiser Iced Tea', detail: '8-pack 12oz can', price: 23.99, emoji: '🌞', accent: 'bg-yellow-400', image: `${P}/sun-cruiser-iced-tea-12-pack-12oz-can.jpg` },
  { id: 's-truly-berry', name: 'TRULY Berry Variety', detail: '12-pack 12oz can', price: 19.99, emoji: '🍓', accent: 'bg-pink-500' },
  { id: 's-highnoon-tea', name: 'High Noon Vodka Iced Tea Variety', detail: '8-pack 12oz can', price: 21.99, emoji: '🌞', accent: 'bg-amber-400' },
  { id: 's-highnoon-elpres', name: 'High Noon El Pres Variety', detail: '12-pack 12oz can', price: 31.99, emoji: '🍍', accent: 'bg-yellow-500' },
  { id: 's-topochico', name: 'Topo Chico Hard Seltzer Variety', detail: '12-pack 12oz can', price: 19.99, emoji: '💧', accent: 'bg-emerald-400' },
  { id: 's-mighty-swell', name: 'Mighty Swell Variety', detail: '12-pack 12oz can', price: 18.49, emoji: '🥤', accent: 'bg-cyan-500' },
  { id: 's-mikes-harder', name: "Mike's Harder Variety", detail: '8-pack 16oz can', price: 16.99, emoji: '🍋', accent: 'bg-yellow-500' },
  { id: 's-momwater', name: 'Mom Water Variety', detail: '8-pack 12oz can', price: 19.99, emoji: '💧', accent: 'bg-pink-400' },
  { id: 's-nutrl', name: 'Nutrl Fruit Vodka Seltzer Variety', detail: '8-pack 12oz can', price: 19.99, emoji: '🍇', accent: 'bg-purple-400' },
  { id: 's-surfside', name: 'Surfside Lemonade Variety', detail: '8-pack 12oz can', price: 24.99, emoji: '🍋', accent: 'bg-yellow-400' },
];

// ---------- STEP 2: LIQUOR ----------

// 5 whiskeys
export const whiskeys: BuilderProduct[] = [
  { id: 'l-jameson', name: 'Jameson Irish Whiskey', detail: '750ml', price: 34.99, emoji: '🥃', accent: 'bg-emerald-700', image: `${P}/Jameson Irish Whiskey • 750ml Bottle/jameson-irish-whiskey-1.png` },
  { id: 'l-bulleit-bourbon', name: 'Bulleit Bourbon', detail: '750ml', price: 32.99, emoji: '🥃', accent: 'bg-amber-700', image: `${P}/buffalo-trace-bourbon-750ml.png` },
  { id: 'l-crown-royal', name: 'Crown Royal Blended Whiskey', detail: '750ml', price: 34.99, emoji: '👑', accent: 'bg-purple-700' },
  { id: 'l-templeton-rye', name: 'Templeton Rye 6 Year', detail: '750ml', price: 49.99, emoji: '🥃', accent: 'bg-orange-800', image: `${P}/Templeton Rye 6 Year Whiskey • 750ml Bottle/templeton-rye-6-year-whiskey.png` },
  { id: 'l-basil-hayden', name: 'Basil Hayden Bourbon', detail: '750ml', price: 43.99, emoji: '🥃', accent: 'bg-amber-600' },
];

// 5 tequilas
export const tequilas: BuilderProduct[] = [
  { id: 'l-casamigos-blanco', name: 'Casamigos Blanco', detail: '750ml', price: 49.99, emoji: '🌵', accent: 'bg-lime-600' },
  { id: 'l-don-julio-blanco', name: 'Don Julio Blanco 80', detail: '750ml', price: 62.99, emoji: '🌵', accent: 'bg-emerald-600' },
  { id: 'l-818-blanco', name: '818 Tequila Blanco', detail: '750ml', price: 32.99, emoji: '🌵', accent: 'bg-lime-500' },
  { id: 'l-camarena-repo', name: 'Camarena Reposado', detail: '750ml', price: 29.99, emoji: '🌵', accent: 'bg-amber-500' },
  { id: 'l-cazadores-repo', name: 'Cazadores Reposado', detail: '750ml', price: 29.99, emoji: '🌵', accent: 'bg-orange-500' },
];

// 5 vodkas
export const vodkas: BuilderProduct[] = [
  { id: 'l-titos', name: "Tito's Handmade Vodka", detail: '750ml', price: 22.99, emoji: '🍸', accent: 'bg-blue-500', image: `${P}/titos-handmade-vodka-750ml.jpg` },
  { id: 'l-deepeddy', name: 'Deep Eddy Vodka', detail: '750ml', price: 20.99, emoji: '🍸', accent: 'bg-sky-500', image: `${P}/Deep Eddy Vodka • 750ml Bottle/deep-eddy-vodka-80-proof.png` },
  { id: 'l-deepeddy-rubyred', name: 'Deep Eddy Ruby Red Grapefruit', detail: '750ml', price: 22.99, emoji: '🍇', accent: 'bg-rose-500', image: `${P}/Deep Eddy Ruby Red Grapefruit Vodka • 750ml Bottle/deep-eddy-vodka-ruby-red.png` },
  { id: 'l-deepeddy-lemon', name: 'Deep Eddy Lemon Vodka', detail: '750ml', price: 22.99, emoji: '🍋', accent: 'bg-yellow-400', image: `${P}/Deep Eddy Lemon Vodka • 750ml Bottle/deep-eddy-vodka-lemon-1.png` },
  { id: 'l-dripping-vodka', name: 'Dripping Springs Vodka', detail: '750ml', price: 22.99, emoji: '🍸', accent: 'bg-cyan-500', image: `${P}/Dripping Springs Vodka • 750ml Bottle/dripping-spring-vodka-80-proof.png` },
];

// 3 gins
export const gins: BuilderProduct[] = [
  { id: 'l-dripping-gin', name: 'Dripping Springs Artisan Gin', detail: '750ml', price: 32.99, emoji: '🌿', accent: 'bg-emerald-600', image: `${P}/Floradora Party Pitcher Kit (16 drinks)/dripping-spring-gin-artisanal.png` },
  { id: 'l-aviation', name: 'Aviation American Gin', detail: '750ml', price: 34.99, emoji: '✈️', accent: 'bg-sky-600' },
  { id: 'l-plymouth', name: 'Plymouth Gin', detail: '750ml', price: 35.99, emoji: '🌿', accent: 'bg-teal-700' },
];

// 3 rums
export const rums: BuilderProduct[] = [
  { id: 'l-malibu-coconut', name: 'Malibu Coconut Rum', detail: '750ml', price: 22.99, emoji: '🥥', accent: 'bg-amber-300', image: `${P}/Malibu Coconut Rum • 750ml Bottle/malibu-coconut.png` },
  { id: 'l-bacardi-superior', name: 'Bacardi Light Rum Superior 80', detail: '750ml', price: 18.99, emoji: '🌴', accent: 'bg-green-600' },
  { id: 'l-captain-morgan', name: 'Captain Morgan Spiced Rum', detail: '750ml', price: 23.99, emoji: '🏴‍☠️', accent: 'bg-amber-700' },
];

// COCKTAIL KITS (10) — first 10 from the cocktail-kits collection
export const cocktailKits: BuilderProduct[] = [
  { id: 'k-aperol-spritz', name: 'Aperol Spritz Pitcher Kit', detail: '16 drinks', price: 67.99, emoji: '🍹', accent: 'bg-orange-500', image: `${P}/aperol-spritz-kit.png` },
  { id: 'k-austin-rita', name: 'Austin Rita Pitcher Kit', detail: '24 drinks', price: 89.99, emoji: '🍹', accent: 'bg-lime-500', image: `${P}/Austin Rita Party Pitcher Kit (24 drinks)/dulce-vida-blanco-tequila-80-proof.png` },
  { id: 'k-blue-margarita', name: 'Blue Margarita Pitcher Kit', detail: '24 drinks', price: 62.99, emoji: '🍹', accent: 'bg-blue-500', image: `${P}/Blue Margarita Party Pitcher Kit (24 drinks)/leroux-blue-curacao-750ml.png` },
  { id: 'k-cosmo-punch', name: 'Cosmo Punch Pitcher Kit', detail: '30 drinks', price: 74.99, emoji: '🍸', accent: 'bg-pink-600', image: `${P}/Cosmo Punch Party Pitcher Kit (30 drinks)/deep-eddy-vodka-ruby-red.png` },
  { id: 'k-skinny-margarita', name: 'Skinny Margarita Pitcher Kit', detail: '20 drinks', price: 74.99, emoji: '🍹', accent: 'bg-emerald-500', image: `${P}/Skinny Margarita Pitcher Kit (20 drinks per pitcher)/dulce-vida-blanco-tequila-80-proof.png` },
  { id: 'k-strawberry-margarita', name: 'Strawberry Margarita Pitcher Kit', detail: 'Pitcher', price: 72.99, emoji: '🍓', accent: 'bg-rose-500', image: `${P}/Strawberry Margarita Pitcher Kit/strawberry-simple-syrup.png` },
  { id: 'k-tequila-sunrise', name: 'Tequila Sunrise Pitcher Kit', detail: '16 drinks', price: 67.45, emoji: '🌅', accent: 'bg-orange-400', image: `${P}/Tequila Sunrise Party Pitcher Kit (16 drinks)/roses-grenadine-syrup-12oz.png` },
  { id: 'k-titos-lemonade', name: "Tito's Lemonade Pitcher Kit", detail: '16 drinks', price: 53.99, emoji: '🍋', accent: 'bg-yellow-400', image: `${P}/Tito's Lemonade Party Pitcher Kit (16 drinks)/titos-handmade-vodka-80-1lt.png` },
  { id: 'k-hugo-spritz', name: 'Hugo Spritz Cocktail Kit', detail: 'Single kit', price: 69.99, emoji: '🌿', accent: 'bg-emerald-400', image: `${P}/Hugo Spritz Cocktail Kit/amor-di-amanti-prosecco-spumante-750-ml.png` },
  { id: 'k-espresso-martini', name: 'Espresso Martini Cocktail Kit', detail: 'Single kit', price: 109.99, emoji: '☕', accent: 'bg-amber-900' },
];

// ---------- STEP 3: SODAS, MIXERS & PARTY SUPPLIES ----------

// Sodas & Sparkling Waters
export const sodas: BuilderProduct[] = [
  { id: 'm-topo-original', name: 'Topo Chico Mineral Water', detail: '12-pack 12oz', price: 16.99, emoji: '💧', accent: 'bg-emerald-500', image: `${P}/Aperol Spritz Party Pitcher Kit (16 Drinks)/topo-chico-regular-1-5-liters.png` },
  { id: 'm-liquid-death-spark', name: 'Liquid Death Sparkling Water', detail: '500ml can', price: 1.99, emoji: '💀', accent: 'bg-stone-700', image: `${P}/sparkling-water.png` },
  { id: 'm-liquid-death-mtn', name: 'Liquid Death Mountain Water', detail: '24-pack 500ml', price: 39.99, emoji: '💀', accent: 'bg-stone-800' },
  { id: 'm-pellegrino', name: 'San Pellegrino Sparkling Water', detail: '750ml bottle', price: 3.99, emoji: '💧', accent: 'bg-cyan-500' },
  { id: 'm-sprite', name: 'Sprite Lemon-lime Soda', detail: '2L bottle', price: 4.99, emoji: '🥤', accent: 'bg-green-500', image: `${P}/sprite-2l.png` },
  { id: 'm-diet-coke', name: 'Diet Coke', detail: '12-pack 12oz can', price: 7.99, emoji: '🥤', accent: 'bg-gray-700' },
  { id: 'm-heb-ginger-beer', name: 'HEB Ginger Beer', detail: '1L bottle', price: 2.99, emoji: '🥤', accent: 'bg-amber-400', image: `${P}/heb-ginger-ale-1l.png` },
  { id: 'm-redbull', name: 'Red Bull Energy Drink', detail: '12-pack 250ml can', price: 29.99, emoji: '⚡', accent: 'bg-blue-700' },
];

// Cups, Ice, Ping-pong & Party Supplies
export const supplies: BuilderProduct[] = [
  { id: 'p-bag-ice', name: 'Bag of Ice (20lbs)', detail: '20lbs cubed', price: 7.99, emoji: '🧊', accent: 'bg-cyan-300', image: `${P}/bag-of-ice-20lbs.png` },
  { id: 'p-cup-ice', name: 'Cup of Ice', detail: 'Single', price: 0.99, emoji: '🧊', accent: 'bg-cyan-200' },
  { id: 'p-solo-cups', name: 'Red & Blue Solo Cups', detail: '25-pack 16oz', price: 8.75, emoji: '🥤', accent: 'bg-red-600', image: `${P}/Tito's & Topo/240-16-oz-solo-cups.png` },
  { id: 'p-shot-glasses', name: 'Plastic Shot Glasses', detail: '10-pack', price: 5.99, emoji: '🥃', accent: 'bg-purple-500', image: `${P}/plastic-shot-glasses-10-pack.png` },
  { id: 'p-champagne-flutes', name: 'Plastic Champagne Flutes', detail: '10-pack', price: 9.99, emoji: '🥂', accent: 'bg-amber-300' },
  { id: 'p-pong-balls', name: 'Ping Pong Balls', detail: '10pcs', price: 5.99, emoji: '🏓', accent: 'bg-orange-500', image: `${P}/Texas Pong Pack/10-ping-pong-balls.png` },
  { id: 'p-cocktail-picks', name: 'Wooden Cocktail Picks', detail: '100-pack', price: 5.99, emoji: '🍢', accent: 'bg-amber-600', image: `${P}/wooden-cocktail-picks-100-pack.png` },
  { id: 'p-pitcher', name: 'Drink Pitcher', detail: '1 gallon', price: 12.0, emoji: '🍹', accent: 'bg-cyan-400', image: `${P}/pitcher.jpg` },
];

export const stepOneCategories: BuilderCategory[] = [
  { key: 'craft-beer', label: 'Craft Beer', products: craftBeers },
  { key: 'light-beer', label: 'Light Beer', products: lightBeers },
  { key: 'seltzer', label: 'Seltzers', products: seltzers },
];

export const stepTwoCategories: BuilderCategory[] = [
  { key: 'whiskey', label: 'Whiskey', products: whiskeys },
  { key: 'tequila', label: 'Tequila', products: tequilas },
  { key: 'vodka', label: 'Vodka', products: vodkas },
  { key: 'gin', label: 'Gin', products: gins },
  { key: 'rum', label: 'Rum', products: rums },
  { key: 'kits', label: 'Cocktail Kits', products: cocktailKits },
];

export const stepThreeCategories: BuilderCategory[] = [
  { key: 'soda', label: 'Sodas & Sparkling Waters', products: sodas },
  { key: 'supplies', label: 'Cups, Ice & Party Supplies', products: supplies },
];

export type Selection = Record<string, number>;

export const allProducts: BuilderProduct[] = [
  ...craftBeers,
  ...lightBeers,
  ...seltzers,
  ...whiskeys,
  ...tequilas,
  ...vodkas,
  ...gins,
  ...rums,
  ...cocktailKits,
  ...sodas,
  ...supplies,
];

export const productById = Object.fromEntries(
  allProducts.map((p) => [p.id, p]),
) as Record<string, BuilderProduct>;
