// Build-order step 2: Clothes VTO on the shoe-rendered output of step 1.
// This is the chain: Shoes VTO result -> src photo for Clothes VTO.
//
// Usage: node scripts/spike-cloth.js [garment-image] [garment_category]
// Default garment: assets/input/garment.jpg, category lower_body.
// Requires assets/results/spike-shoes.jpg to exist (run spike:shoes first).

import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { clothVto } from '../server/lib/youcam.js';

const [garment = 'assets/input/garment.jpg', category = 'lower_body'] = process.argv.slice(2);
const basePhoto = 'assets/results/spike-shoes.jpg';

if (!existsSync(basePhoto)) {
  console.error(`Missing ${basePhoto} — run \`npm run spike:shoes\` first; the chain starts there.`);
  process.exit(1);
}
if (!existsSync(garment)) {
  console.error(`Missing garment image: ${garment} (flat product shot of pants, min 512x512).`);
  process.exit(1);
}

const { imagePath, cached } = await clothVto(basePhoto, garment, category);
await mkdir('assets/results', { recursive: true });
await copyFile(imagePath, 'assets/results/spike-cloth.jpg');
console.log(`\nClothes VTO ${cached ? 'replayed from cache (0 units)' : 'ran live'}.`);
console.log('Result: assets/results/spike-cloth.jpg — chain proven end to end.');
