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
// shoes-vto -> verdict -> cloth-vto (as shipped) -> cloth-vto (hemmed)
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
  await step('shoes_vto', tooShort ? 30 : 10, 1800);
  await step('verdict', tooShort ? 80 : 40, 600);
  if (tooShort) {
    // A hem can't fix this size — skip the clothes renders entirely.
    job.result = { baseImage: '/mock/user.jpg', mock: true };
    job.stage = 'done'; job.pct = 100; job.done = true;
    return;
  }
  await step('cloth_vto_shipped', 55, 1600);
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
  const { garment, shoe, gender, source } = job.input;
  // YouCam's VTO tasks reject photos without a detectable face (error_no_face),
  // so both inputs must be full-length shots with the face visible.
  const userPhoto = path.join(ROOT, source === 'avatar' ? 'assets/input/avatar.jpg' : 'assets/input/user.jpg');
  if (!existsSync(userPhoto)) throw new Error(`Missing input image: ${path.relative(ROOT, userPhoto)}`);
  const garmentImg = path.join(ROOT, 'web/public', garment.image);
  const shoeImg = path.join(ROOT, 'web/public', shoe.image);

  job.stage = 'shoes_vto'; job.pct = 5;
  const base = await shoesVto(userPhoto, shoeImg, gender);
  job.stage = 'verdict'; job.pct = 40;
  if (job.input.verdict.tone === 'short') {
    // No clothes renders for an unfixable size — saves 2 API units per run.
    job.result = { baseImage: toCacheUrl(base.imagePath), mock: false };
    job.stage = 'done'; job.pct = 100; job.done = true;
    return;
  }
  job.stage = 'cloth_vto_shipped'; job.pct = 50;
  const shipped = await clothVto(base.imagePath, garmentImg, 'lower_body');
  job.stage = 'cloth_vto_hemmed'; job.pct = 75;
  // Pre-shortened "after" asset when we have one; falls back to as-shipped.
  const afterImg = garmentImg.replace(/\.jpg$/, '-hemmed.jpg');
  const hemmed = await clothVto(base.imagePath, existsSync(afterImg) ? afterImg : garmentImg, 'lower_body');

  job.result = {
    baseImage: toCacheUrl(base.imagePath),
    shippedImage: toCacheUrl(shipped.imagePath),
    hemmedImage: toCacheUrl(hemmed.imagePath),
    mock: false,
  };
  job.stage = 'done'; job.pct = 100; job.done = true;
}

const toCacheUrl = p => '/renders/' + path.basename(p);

app.use('/renders', express.static(path.join(ROOT, 'cache')));
app.use('/mock', express.static(path.join(ROOT, 'assets/input')));

const dist = path.join(ROOT, 'web/dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('/finder', (_req, res) => res.sendFile(path.join(dist, 'finder.html')));
  app.get(/^\/(?!api|renders|mock|finder).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  app.use('/img', express.static(path.join(ROOT, 'web/public/img')));
}

app.listen(PORT, () => {
  console.log(`Hemline server on http://localhost:${PORT} ${MOCK ? '(MOCK mode, no API units spent)' : '(LIVE mode)'}`);
});
