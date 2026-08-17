#!/usr/bin/env node
// Swap the person used for try-on renders.
//
//   node scripts/set-demo-user.js <image>            install it
//   node scripts/set-demo-user.js <image> --avatar   install as the avatar path
//   node scripts/set-demo-user.js <image> --warm     install, then pre-render every garment
//
// The image is normalised to 900px wide and stripped of metadata (the previous
// avatar shipped with a photographer's copyright claim in its XMP). The photo
// must be full length with the face visible — YouCam's VTO rejects anything
// else with error_no_face. A plain background and slim legwear read best: the
// bigger the difference between what they are wearing and denim, the more the
// try-on looks like a try-on.
//
// Swapping invalidates every cached render, because the cache key is a hash of
// the input file bytes. Renders come back at 2 API units per garment, charged
// the first time someone opens it — or all at once with --warm.

import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const src = args.find(a => !a.startsWith('--'));
const asAvatar = args.includes('--avatar');
const warm = args.includes('--warm');

if (!src) {
  console.error('usage: node scripts/set-demo-user.js <image> [--avatar] [--warm]');
  process.exit(1);
}
if (!existsSync(src)) {
  console.error(`no such file: ${src}`);
  process.exit(1);
}

const target = path.join(ROOT, 'assets/input', asAvatar ? 'avatar.jpg' : 'user.jpg');
const backup = target.replace(/\.jpg$/, `.previous.jpg`);

if (existsSync(target)) {
  copyFileSync(target, backup);
  console.log(`backed up current → ${path.relative(ROOT, backup)}`);
}

try {
  execFileSync('ffmpeg', [
    '-loglevel', 'error', '-y', '-i', src,
    '-map_metadata', '-1',
    '-vf', 'scale=900:-2',
    '-q:v', '3', target,
  ]);
} catch {
  console.error('ffmpeg failed — is it installed? (brew install ffmpeg)');
  process.exit(1);
}

const claims = readFileSync(target).toString('latin1').match(/photograph|copyright|pexels|unsplash|getty/gi) ?? [];
console.log(`installed → ${path.relative(ROOT, target)}`);
console.log(`metadata claims remaining: ${claims.length}`);
console.log('\nEvery cached render for this person is now cold.');

if (!warm) {
  console.log('Re-run with --warm to pre-render all garments (2 API units each), or');
  console.log('leave it — each garment renders on first open, ~30s and 2 units.');
  process.exit(0);
}

const { clothVto } = await import('../server/lib/youcam.js');
const catalog = JSON.parse(readFileSync(path.join(ROOT, 'data/catalog.json'), 'utf8'));
let spent = 0, cached = 0, failed = [];

for (const g of catalog) {
  const main = path.join(ROOT, 'web/public', g.image);
  const hemmed = main.replace(/\.jpg$/, '-hemmed.jpg');
  for (const [kind, ref] of [['shipped', main], ['hemmed', existsSync(hemmed) ? hemmed : main]]) {
    try {
      const r = await clothVto(target, ref, 'lower_body');
      if (r.cached) { cached++; console.log(`  [cache] ${g.id}/${kind}`); }
      else { spent++; console.log(`  [SPENT] ${g.id}/${kind}`); }
    } catch (err) {
      failed.push(`${g.id}/${kind}`);
      console.log(`  [FAIL ] ${g.id}/${kind}: ${String(err.message).split('\n')[0]}`);
    }
  }
}
console.log(`\nunits spent: ${spent}, already cached: ${cached}, failed: ${failed.length} ${failed.join(', ')}`);
