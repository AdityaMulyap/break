// Verifies both too_short behaviors after the shoes-first reorder:
// A) reachable target (102 cm + Court Sneaker + size 30) -> size suggestion,
//    one-tap switch re-runs the verdict.
// B) unreachable target (115 cm + Pointed Pump + size 30) -> honest no-suggestion
//    card, "Buy anyway" -> checkout hem line disabled.

import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
});

const tapIn = page => (sel, text) => page.evaluate((sel, text) => {
  const el = [...document.querySelectorAll(sel)].find(e => e.textContent.includes(text));
  if (!el) throw new Error(`no ${sel} containing "${text}"`);
  el.click();
}, sel, text);

async function walk({ cm, shoe, expectCta }) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
  const tap = tapIn(page);
  await page.evaluateOnNewDocument(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto('http://localhost:5171', { waitUntil: 'networkidle0' });
  await page.type('.measure-row input', String(cm));
  await tap('.btn', `Save ${cm} cm`);
  await page.waitForSelector('.row-card img');
  await tap('.row-card', shoe);
  await tap('.btn', 'Browse the rack');
  await page.waitForSelector('.row-card img');
  await tap('.row-card', 'Slate Straight-Leg');
  await page.waitForSelector('.chips button');
  await tap('.chips button', '30');
  await tap('.btn', expectCta);
  await page.waitForSelector('.verdict-hero', { timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));
  return { page, tap };
}

// Scenario A: reachable
{
  const { page, tap } = await walk({ cm: 102, shoe: 'Court Sneaker', expectCta: 'runs short — see why' });
  console.log('A verdict:', await page.$eval('.verdict-hero', el => el.textContent));
  console.log('A suggest:', await page.$eval('.suggest', el => el.textContent));
  await tap('.btn', 'instead');
  await page.waitForSelector('.verdict-hero', { timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));
  console.log('A after switch:', await page.$eval('.verdict-hero', el => el.textContent));
  await page.close();
}

// Scenario B: unreachable
{
  const { page, tap } = await walk({ cm: 115, shoe: 'Pointed Pump', expectCta: 'runs short — see why' });
  console.log('B verdict:', await page.$eval('.verdict-hero', el => el.textContent));
  console.log('B suggest:', await page.$eval('.suggest', el => el.textContent));
  console.log('B shoe pane:', (await page.$$('.pane')).length, 'pane(s)');
  await page.screenshot({ path: 'assets/screenshots/6-tooshort.png' });
  await tap('.btn', 'anyway');
  await page.waitForSelector('.order');
  const hemLine = await page.$eval('.order .line:nth-child(2)', el => ({
    text: el.textContent, disabled: el.className.includes('disabled'),
    switchDisabled: el.querySelector('input').disabled,
  }));
  console.log('B checkout hem line:', JSON.stringify(hemLine));
  await page.close();
}

await browser.close();
console.log('done');
