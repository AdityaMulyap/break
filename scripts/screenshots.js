// Drive the happy path headlessly at iPhone size and save screenshots of all
// five screens to assets/screenshots/. Requires the server on :5171.

import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL || 'http://localhost:5171';
const OUT = 'assets/screenshots';
await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
page.on('console', m => m.type() === 'error' && console.error('CONSOLE:', m.text()));

const shot = name => page.screenshot({ path: `${OUT}/${name}.png` });
const tapByText = async (sel, text) => {
  await page.evaluate((sel, text) => {
    const el = [...document.querySelectorAll(sel)].find(e => e.textContent.includes(text));
    if (!el) throw new Error(`no ${sel} containing "${text}"`);
    el.click();
  }, sel, text);
};

await page.evaluateOnNewDocument(() => localStorage.clear());
await page.goto(BASE, { waitUntil: 'networkidle0' });

// 1 measure
await page.waitForSelector('.measure-row input');
await shot('1-measure-empty');
await page.type('.measure-row input', '100');
await tapByText('.seg button', 'Half break');
await shot('1-measure');
await tapByText('.btn', 'Save 100 cm');

// 2 catalog
await page.waitForSelector('.row-card img');
await shot('2-catalog');
await tapByText('.row-card', 'Slate Straight-Leg');
await page.waitForSelector('.chips button');
await tapByText('.chips button', '34');
await shot('2-catalog-size');
await tapByText('.btn', 'Continue with size 34');

// 3 shoes
await page.waitForSelector('.row-card img');
await shot('3-shoes');
await tapByText('.row-card', 'Court Sneaker');
await tapByText('.btn', 'Check the length');

// 4 loading then verdict
await page.waitForSelector('.tasklist');
await shot('4-loading');
await page.waitForSelector('.verdict', { timeout: 30000 });
await new Promise(r => setTimeout(r, 700));
await shot('4-verdict');

// 5 checkout + confirmation
await tapByText('.btn', 'Buy');
await page.waitForSelector('.order');
await shot('5-checkout');
await tapByText('.btn', 'Place order');
await page.waitForSelector('.confirm');
await shot('5-confirm');

await browser.close();
console.log(`Saved screenshots to ${OUT}/`);
