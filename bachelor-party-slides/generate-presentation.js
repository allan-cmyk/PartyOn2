const pptxgen = require('pptxgenjs');
const html2pptx = require('/Users/matthewrundle/.claude/skills/pptx/scripts/html2pptx.js');

async function createPresentation() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Party On Delivery';
  pptx.title = 'The Last Gentleman\'s Evening - Bachelor Party';

  // Slide 1: Title
  await html2pptx('slide1-title.html', pptx);

  // Slide 2: Vision
  await html2pptx('slide2-vision.html', pptx);

  // Slide 3: Package
  await html2pptx('slide3-package.html', pptx);

  // Slide 4: Experience
  await html2pptx('slide4-experience.html', pptx);

  // Slide 5: Logistics
  await html2pptx('slide5-logistics.html', pptx);

  // Slide 6: Investment
  await html2pptx('slide6-investment.html', pptx);

  // Slide 7: Action
  await html2pptx('slide7-action.html', pptx);

  await pptx.writeFile({ fileName: 'Bachelor-Party-Lake-Travis.pptx' });
  console.log('Presentation created: Bachelor-Party-Lake-Travis.pptx');
}

createPresentation().catch(console.error);
