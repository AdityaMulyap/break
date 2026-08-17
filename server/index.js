// Hemline server: holds the API key, proxies YouCam calls through the disk
// cache, computes verdicts, serves the built frontend.
//
// Mock mode (no credits burned): set HEMLINE_MOCK=1, or it activates itself
// when YOUCAM_API_KEY is missing. Renders are replaced with local images and
// a simulated task timeline so the UI's loading states are real.

import express from 'express';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { fitVerdict, hemTargetCm } from '../lib/fit.js';
import { shoesVto, clothVto } from './lib/youcam.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.PORT || 5171;
const MOCK = process.env.HEMLINE_MOCK === '1' || !process.env.YOUCAM_API_KEY;

const catalog = JSON.parse(readFileSync(path.join(ROOT, 'data/catalog.json'), 'utf8'));
const shoes = JSON.parse(readFileSync(path.join(ROOT, 'data/shoes.json'), 'utf8'));
const benchmarks = JSON.parse(readFileSync(path.join(ROOT, 'data/benchmarks.json'), 'utf8'));

const app = express();
app.use(express.json());

app.get('/api/catalog', (_req, res) => res.json(catalog));
app.get('/api/shoes', (_req, res) => res.json(shoes));
app.get('/api/benchmarks', (_req, res) => res.json(benchmarks));
app.get('/api/config', (_req, res) => res.json({ mock: MOCK }));

// In-memory render jobs. Stages mirror the real chain so the UI is honest:
// verdict -> cloth-vto (as shipped) -> cloth-vto (hemmed)
const jobs = new Map();

app.post('/api/render', (req, res) => {
  const { garmentId, lengthLabel, shoeId, benchmarkCm, gender = 'female', source = 'photo' } = req.body ?? {};
  const garment = catalog.find(g => g.id === garmentId);
  const length = garment?.lengths.find(l => l.label === lengthLabel);
  const shoe = shoes.find(s => s.id === shoeId);
  if (!garment || !length || !shoe || typeof benchmarkCm !== 'number') {
    return res.status(400).json({ error: 'garmentId, lengthLabel, shoeId, benchmarkCm required' });
  }

  const v = fitVerdict({ benchmarkCm, garmentCm: length.inseamCm, shoe, stretch: garment.stretch });
  const hemTarget = hemTargetCm({ benchmarkCm, shoe });

  const job = {
    id: randomUUID(),
    stage: 'shoes_vto',
    pct: 0,
    done: false,
    error: null,
    result: null,
    input: { garment, length, shoe, benchmarkCm, gender, source, verdict: v, hemTarget },
  };
  jobs.set(job.id, job);
  (MOCK ? runMockJob : runRealJob)(job).catch(err => {
    job.error = String(err.message || err);
    job.done = true;
  });
  res.json({ jobId: job.id, verdict: v, hemTargetCm: hemTarget });
});

// Optional second YouCam task: put the customer's chosen shoe on the finished
// try-on. Deliberately on demand rather than part of the chain — the shoes task
// regenerates the whole frame (it invents a new setting), so it cannot share the
// before/after strip's backdrop, and every call costs a unit. The cloth render it
// builds on is already cached, so the request is one unit, never three.
app.post('/api/shoe-preview', (req, res) => {
  const { garmentId, shoeId, source = 'photo', variant = 'hemmed', gender = 'female' } = req.body ?? {};
  const garment = catalog.find(g => g.id === garmentId);
  const shoe = shoes.find(s => s.id === shoeId);
  if (!garment || !shoe) return res.status(400).json({ error: 'garmentId and shoeId required' });

  const job = { id: randomUUID(), stage: 'shoes_vto', pct: 10, done: false, error: null, result: null };
  jobs.set(job.id, job);
  (MOCK ? runMockShoePreview : runShoePreview)(job, { garment, shoe, source, variant, gender })
    .catch(err => { job.error = String(err.message || err); job.done = true; });
  res.json({ jobId: job.id });
});

async function runMockShoePreview(job) {
  await new Promise(r => setTimeout(r, 1500));
  job.result = { shoeImage: '/mock/user.jpg', mock: true };
  job.stage = 'done'; job.pct = 100; job.done = true;
}

async function runShoePreview(job, { garment, shoe, source, variant, gender }) {
  const userPhoto = path.join(ROOT, source === 'avatar' ? 'assets/input/avatar.jpg' : 'assets/input/user.jpg');
  const garmentImg = path.join(ROOT, 'web/public', garment.image);
  const afterImg = garmentImg.replace(/\.jpg$/, '-hemmed.jpg');
  const ref = variant === 'hemmed' && existsSync(afterImg) ? afterImg : garmentImg;

  // Cached from the try-on that is already on screen, so this costs nothing.
  const base = await clothVto(userPhoto, ref, 'lower_body');
  const withShoes = await shoesVto(base.imagePath, path.join(ROOT, 'web/public', shoe.image), gender);

  job.result = { shoeImage: toCacheUrl(withShoes.imagePath), mock: false };
  job.stage = 'done'; job.pct = 100; job.done = true;
}

app.get('/api/render/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'no such job' });
  const { stage, pct, done, error, result } = job;
  res.json({ stage, pct, done, error, result });
});

async function runMockJob(job) {
  const step = async (stage, pct, ms) => {
    job.stage = stage; job.pct = pct;
    await new Promise(r => setTimeout(r, ms));
  };
  const tooShort = job.input.verdict.tone === 'short';
  await step('verdict', tooShort ? 40 : 10, 600);
  if (tooShort) await step('shoes_vto', 80, 1800);
  if (tooShort) {
    // A hem can't fix this size — skip the clothes renders entirely.
    job.result = { baseImage: '/mock/user.jpg', mock: true };
    job.stage = 'done'; job.pct = 100; job.done = true;
    return;
  }
  await step('cloth_vto_shipped', 40, 1600);
  await step('cloth_vto_hemmed', 80, 1600);
  job.result = {
    baseImage: '/mock/user.jpg',
    shippedImage: '/mock/user-shipped.jpg',
    hemmedImage: '/mock/user-hemmed.jpg',
    mock: true,
  };
  job.stage = 'done'; job.pct = 100; job.done = true;
}

async function runRealJob(job) {
  const { garment, source } = job.input;
  // YouCam's VTO tasks reject photos without a detectable face (error_no_face),
  // so both inputs must be full-length shots with the face visible.
  const userPhoto = path.join(ROOT, source === 'avatar' ? 'assets/input/avatar.jpg' : 'assets/input/user.jpg');
  if (!existsSync(userPhoto)) throw new Error(`Missing input image: ${path.relative(ROOT, userPhoto)}`);
  const garmentImg = path.join(ROOT, 'web/public', garment.image);

  job.stage = 'verdict'; job.pct = 5;
  if (job.input.verdict.tone === 'short') {
    // Too short to fix: a hem only removes length, so there is no "your length"
    // frame to render. Show it as shipped and let the UI drop the length toggle,
    // rather than offering a hemmed view that would make the problem worse.
    job.stage = 'cloth_vto_shipped'; job.pct = 45;
    const shipped = await clothVto(userPhoto, garmentImg, 'lower_body');
    job.result = {
      baseImage: toCacheUrl(shipped.imagePath),
      shippedImage: toCacheUrl(shipped.imagePath),
      sourceImage: sourceUrl(source),
      mock: false,
    };
    job.stage = 'done'; job.pct = 100; job.done = true;
    return;
  }

  // Clothes last, on the raw photo. Measured 2026-08-17: BOTH YouCam tasks
  // regenerate the whole image rather than editing one region — the shoes task
  // relocated a studio portrait to a cobblestone street, and running it last
  // (after cloth-v4) swapped the jeans for denim shorts. cloth-v4 is the better
  // behaved of the two: it holds the pose and background, and only invents the
  // footwear. On a denim store the jeans have to be right, so cloth-v4 owns the
  // final frame. Consequence: the rendered shoes are cloth-v4's invention, not
  // the picked shoe — shoe choice drives the length verdict, not this image.
  job.stage = 'cloth_vto_shipped'; job.pct = 30;
  const shipped = await clothVto(userPhoto, garmentImg, 'lower_body');
  job.stage = 'cloth_vto_hemmed'; job.pct = 65;
  // Pre-shortened "after" asset when we have one; falls back to as-shipped.
  const afterImg = garmentImg.replace(/\.jpg$/, '-hemmed.jpg');
  const hemmed = await clothVto(userPhoto, existsSync(afterImg) ? afterImg : garmentImg, 'lower_body');

  job.result = {
    baseImage: toCacheUrl(shipped.imagePath),
    shippedImage: toCacheUrl(shipped.imagePath),
    hemmedImage: toCacheUrl(hemmed.imagePath),
    sourceImage: sourceUrl(source),
    mock: false,
  };
  job.stage = 'done'; job.pct = 100; job.done = true;
}

const toCacheUrl = p => '/renders/' + path.basename(p);
// The untouched input, so the UI can show the customer their own "before".
const sourceUrl = source => (source === 'avatar' ? '/mock/avatar.jpg' : '/mock/user.jpg');

// Vite fingerprints everything in /assets, so those can be cached forever. Nothing
// else is fingerprinted — swap a photo at /img/catalog/g1.jpg and a phone that
// already loaded the old one would keep showing it — so the rest revalidates on
// every request and rides ETags for the 304.
const setCacheHeaders = (res, filePath) => {
  const immutable = filePath.includes(`${path.sep}assets${path.sep}`);
  res.setHeader('Cache-Control', immutable ? 'public, max-age=31536000, immutable' : 'no-cache');
};

// Render outputs are content-addressed by cache key, so they never change either.
app.use('/renders', express.static(path.join(ROOT, 'cache'), {
  setHeaders: res => res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'),
}));
app.use('/mock', express.static(path.join(ROOT, 'assets/input'), { setHeaders: setCacheHeaders }));

const dist = path.join(ROOT, 'web/dist');
if (existsSync(dist)) {
  app.use(express.static(dist, { setHeaders: setCacheHeaders }));
  const sendHtml = (res, file) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(dist, file));
  };
  app.get('/finder', (_req, res) => sendHtml(res, 'finder.html'));
  app.get(/^\/(?!api|renders|mock|finder).*/, (_req, res) => sendHtml(res, 'index.html'));
} else {
  app.use('/img', express.static(path.join(ROOT, 'web/public/img'), { setHeaders: setCacheHeaders }));
}

app.listen(PORT, () => {
  console.log(`Hemline server on http://localhost:${PORT} ${MOCK ? '(MOCK mode, no API units spent)' : '(LIVE mode)'}`);
});
