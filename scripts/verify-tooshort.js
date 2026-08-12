// One-off check of the too_short path: benchmark 115 + Pointed Pump + size 30
// must show the size suggestion (no "Your fit" lie) and a disabled hem line.

import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
page.on('pageerror', e => console.error('PAGE ERROR:', e.message));

const tap = (sel, text) => page.evaluate((sel, text) => {
  const el = [...document.querySelectorAll(sel)].find(e => e.textContent.includes(text));
  if (!el) throw new Error(`no ${sel} containing "${text}"`);
  el.click();
}, sel, text);

await page.evaluateOnNewDocument(() => localStorage.clear());
await page.goto('http://localhost:5171', { waitUntil: 'networkidle0' });
await page.type('.measure-row input', '115');
await tap('.btn', 'Save 115 cm');
await page.waitForSelector('.row-card img');
await tap('.row-card', 'Slate Straight-Leg');
await page.waitForSelector('.chips button');
await tap('.chips button', '30');
await tap('.btn', 'Continue with size 30');
await page.waitForSelector('.row-card img');
await tap('.row-card', 'Pointed Pump');
await tap('.btn', 'Check the length');
await page.waitForSelector('.verdict-hero', { timeout: 30000 });
await new Promise(r => setTimeout(r, 800));

const verdict = await page.$eval('.verdict-hero', el => el.textContent);
const suggest = await page.$('.suggest');
const suggestText = suggest ? await page.$eval('.suggest', el => el.textContent) : null;
const panes = await page.$$('.pane');
await page.screenshot({ path: 'assets/screenshots/6-tooshort.png' });
console.log('verdict:', verdict);
console.log('suggest card:', suggestText ?? 'MISSING');
console.log('compare panes rendered:', panes.length);

await tap('.btn', 'Check size 34 instead');
await page.waitForSelector('.verdict-hero', { timeout: 30000 });
await new Promise(r => setTimeout(r, 500));
console.log('after size switch:', await page.$eval('.verdict-hero', el => el.textContent));

await tap('.btn', 'Buy');
await page.waitForSelector('.order');
const hemLine = await page.$eval('.order .line:nth-child(2)', el => ({
  text: el.textContent, disabled: el.className.includes('disabled'),
  switchDisabled: el.querySelector('input').disabled,
}));
console.log('checkout hem line:', JSON.stringify(hemLine));
await browser.close();
