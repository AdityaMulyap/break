// Single YouCam API client. Every call is cached on disk by a hash of
// (task name + input file bytes + params) so dev/demo replays never spend units.
// Verified against docs.perfectcorp.com on 2026-08-11:
//   base URL:  https://yce-api-01.makeupar.com
//   upload:    POST /s2s/v2.0/file            -> file_id + presigned PUT url
//   shoes VTO: POST /s2s/v2.0/task/shoes      -> GET /s2s/v2.0/task/shoes/{task_id}
//   cloth VTO: POST /s2s/v2.0/task/cloth-v4   -> GET /s2s/v2.0/task/cloth-v4/{task_id}
// Both tasks take { body: { src_file_id, ref_file_id, ... } }; src = person photo,
// ref = product image. cloth-v4 additionally takes garment_category inside body.

import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CACHE_DIR = path.join(ROOT, 'cache');
const BASE_URL = 'https://yce-api-01.makeupar.com';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

loadDotEnv();

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function apiKey() {
  const key = process.env.YOUCAM_API_KEY;
  if (!key) throw new Error('YOUCAM_API_KEY missing. Copy .env.example to .env and fill it in.');
  return key;
}

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

async function api(method, urlPath, body) {
  const res = await fetch(BASE_URL + urlPath, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    throw new Error(`${method} ${urlPath} -> HTTP ${res.status}\n${JSON.stringify(json, null, 2)}`);
  }
  return json;
}

// Upload a local image, return its file_id. Not cached across runs on purpose:
// Perfect Corp deletes files within 24h, so a stored file_id can go stale.
// Task-level caching below means uploads only happen on a genuine cache miss.
export async function uploadImage(localPath) {
  const bytes = await readFile(localPath);
  const ext = path.extname(localPath).slice(1).toLowerCase();
  const contentType = ext === 'png' ? 'image/png' : ext === 'heic' ? 'image/heic' : 'image/jpeg';
  const init = await api('POST', '/s2s/v2.0/file', {
    files: [{ content_type: contentType, file_name: path.basename(localPath), file_size: bytes.length }],
  });
  const file = (init.result ?? init.data ?? init).files?.[0];
  if (!file?.file_id || !file?.requests?.[0]) {
    throw new Error(`Unexpected File API response:\n${JSON.stringify(init, null, 2)}`);
  }
  const req = file.requests[0];
  const put = await fetch(req.url, { method: req.method || 'PUT', headers: req.headers || {}, body: bytes });
  if (!put.ok) throw new Error(`Upload PUT failed: HTTP ${put.status} ${await put.text()}`);
  return file.file_id;
}

async function pollTask(taskName, taskId) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await api('GET', `/s2s/v2.0/task/${taskName}/${taskId}`);
    const data = res.result ?? res.data ?? res;
    const status = data.task_status ?? data.status;
    if (status === 'success') return data;
    if (status === 'error') {
      throw new Error(`Task ${taskName}/${taskId} failed:\n${JSON.stringify(data, null, 2)}`);
    }
    process.stdout.write(`  polling ${taskName} (${status ?? 'pending'})...\n`);
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(`Task ${taskName}/${taskId} timed out after ${POLL_TIMEOUT_MS / 1000}s`);
}

function findResultUrl(obj) {
  // Result payload shape varies per task; find the first https URL in the tree.
  if (typeof obj === 'string') return obj.startsWith('http') ? obj : null;
  if (Array.isArray(obj)) { for (const v of obj) { const u = findResultUrl(v); if (u) return u; } return null; }
  if (obj && typeof obj === 'object') {
    for (const k of ['url', 'dst_url', 'result_url', 'download_url']) {
      if (typeof obj[k] === 'string' && obj[k].startsWith('http')) return obj[k];
    }
    for (const v of Object.values(obj)) { const u = findResultUrl(v); if (u) return u; }
  }
  return null;
}

/**
 * Run a YouCam task with disk caching.
 * @param {string} taskName  e.g. 'shoes' or 'cloth-v4'
 * @param {Object} inputs    map of role -> local image path, e.g. { src: ..., ref: ... }
 * @param {Object} params    extra JSON merged into the task payload's `body` object
 * @param {Object} topParams extra JSON merged into the payload root (e.g. gender)
 * @returns {{ imagePath: string, cached: boolean, raw?: object }}
 */
export async function runTask(taskName, inputs, params = {}, topParams = {}) {
  const inputHashes = {};
  for (const [role, p] of Object.entries(inputs)) inputHashes[role] = sha256(await readFile(p));
  const cacheKey = sha256(Buffer.from(JSON.stringify({ taskName, inputHashes, params, topParams })));
  const metaPath = path.join(CACHE_DIR, `${cacheKey}.json`);
  const imagePath = path.join(CACHE_DIR, `${cacheKey}.jpg`);

  if (existsSync(metaPath) && existsSync(imagePath)) {
    return { imagePath, cached: true };
  }

  await mkdir(CACHE_DIR, { recursive: true });
  console.log(`[youcam] cache miss for ${taskName} — spending API units`);

  const fileIds = {};
  for (const [role, p] of Object.entries(inputs)) {
    console.log(`  uploading ${role}: ${path.basename(p)}`);
    fileIds[role] = await uploadImage(p);
  }

  const payload = { src_file_id: fileIds.src, ref_file_id: fileIds.ref, ...params, ...topParams };
  console.log(`  POST /s2s/v2.0/task/${taskName}`);
  const created = await api('POST', `/s2s/v2.0/task/${taskName}`, payload);
  const taskId = (created.result ?? created.data ?? created).task_id;
  if (!taskId) throw new Error(`No task_id in response:\n${JSON.stringify(created, null, 2)}`);

  const result = await pollTask(taskName, taskId);
  const url = findResultUrl(result);
  if (!url) throw new Error(`No result URL in success payload:\n${JSON.stringify(result, null, 2)}`);

  const img = await fetch(url);
  if (!img.ok) throw new Error(`Result download failed: HTTP ${img.status}`);
  await writeFile(imagePath, Buffer.from(await img.arrayBuffer()));
  await writeFile(metaPath, JSON.stringify({ taskName, inputHashes, params, taskId, result }, null, 2));
  return { imagePath, cached: false, raw: result };
}

export const shoesVto = (userPhoto, shoeImage, gender = 'male', params = {}) =>
  runTask('shoes', { src: userPhoto, ref: shoeImage }, params, { gender });

export const clothVto = (userPhoto, garmentImage, garmentCategory = 'lower_body', params = {}) =>
  runTask('cloth-v4', { src: userPhoto, ref: garmentImage }, { garment_category: garmentCategory, ...params });
