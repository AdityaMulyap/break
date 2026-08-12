// Build-order step 1: prove the riskiest call — full auth/upload/initiate/poll/
// download cycle for Shoes VTO, through the cache.
//
// Usage: node scripts/spike-shoes.js <user-photo> <shoe-image>
// Defaults: assets/input/user.jpg assets/input/shoe.jpg

import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { shoesVto } from '../server/lib/youcam.js';

const [userPhoto = 'assets/input/user.jpg', shoeImage = 'assets/input/shoe.jpg'] = process.argv.slice(2);

for (const p of [userPhoto, shoeImage]) {
  if (!existsSync(p)) {
    console.error(`Missing input image: ${p}`);
    console.error('Put a full-body user photo and a shoe product image (min 512x512, <10MB, jpg/png) there.');
    process.exit(1);
  }
}

const { imagePath, cached } = await shoesVto(userPhoto, shoeImage);
await mkdir('assets/results', { recursive: true });
await copyFile(imagePath, 'assets/results/spike-shoes.jpg');
console.log(`\nShoes VTO ${cached ? 'replayed from cache (0 units)' : 'ran live'}.`);
console.log('Result: assets/results/spike-shoes.jpg');
