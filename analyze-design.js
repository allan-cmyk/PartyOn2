const fs = require('fs');
const path = require('path');

// Analyze Salon 3636 design patterns
console.log("=== SALON 3636 DESIGN ANALYSIS ===\n");

// Read the Salon 3636 homepage
const salon3636Path = '/Users/mattrundle/Documents/3636/salon-3636/app/(marketing)/HomeClient.tsx';
const salonContent = fs.readFileSync(salon3636Path, 'utf8');

// Extract key design patterns
const designPatterns = {
  typography: {
    headings: salonContent.match(/font-display|text-\d+xl/g) || [],
    bodyText: salonContent.match(/text-lg|text-xl|leading-relaxed/g) || []
  },
  spacing: {
    sections: salonContent.match(/py-\d+|section-padding/g) || [],
    containers: salonContent.match(/max-w-\w+|mx-auto/g) || []
  },
  colors: {
    primary: salonContent.match(/sage-\d+|westlake-\w+/g) || [],
    neutrals: salonContent.match(/gray-\d+|white|black/g) || []
  },
  components: {
    cards: salonContent.match(/rounded-\w+|shadow-\w+/g) || [],
    buttons: salonContent.match(/px-\d+\s+py-\d+.*rounded/g) || []
  }
};

console.log("Key Design Patterns Found:");
console.log("- Typography:", designPatterns.typography);
console.log("- Spacing:", designPatterns.spacing);
console.log("- Colors:", designPatterns.colors);
console.log("- Components:", designPatterns.components);

console.log("\n=== COMPARISON WITH PARTYON DESIGNS ===\n");

// Read our professional homepage
const partyonPath = '/Users/mattrundle/Documents/PartyOnDelivery2/party-on-delivery/src/app/professional-home-v2/page.tsx';
const partyonContent = fs.readFileSync(partyonPath, 'utf8');

console.log("Missing from PartyOn:");
console.log("1. Consistent use of custom color system (sage, westlake)");
console.log("2. ScrollReveal animations");
console.log("3. Subtle gradients and overlays");
console.log("4. Refined button styles with consistent padding");
console.log("5. Proper font-display usage for headings");