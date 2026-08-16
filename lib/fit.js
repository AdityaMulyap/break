// Break's fit model, shared by server and web. Pure math + the DS voice.
//
// The shopper's benchmark pair fits them right in the shoes they usually
// wear. A candidate garment's ideal length shifts with the shoe worn:
// taller shoes carry more length. Offsets are relative to sneakers.
//
// Voice rules (design system): consequences, not measurements. The number
// appears only in the headline where the subline does the real work.

export const TOLERANCE_CM = 1;

/**
 * @param {Object} opts
 * @param {number} opts.benchmarkCm  shopper's own inseam, crotch seam to hem
 * @param {number} opts.garmentCm    candidate garment inseam in the chosen length
 * @param {Object} opts.shoe         { id, name, offsetCm }
 * @param {string} [opts.stretch]    garment stretch class; 'Super Stretch' voids the verdict
 * @returns {{ tone:'fits'|'long'|'short'|'unsure', headline:string, subline:string,
 *             badge:string|null, badgeTone:string|null, targetCm:number, deltaCm:number }}
 */
export function fitVerdict({ benchmarkCm, garmentCm, shoe, stretch }) {
  for (const [name, v] of Object.entries({ benchmarkCm, garmentCm, offsetCm: shoe?.offsetCm })) {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new RangeError(`${name} must be a finite number, got ${v}`);
    }
  }
  const targetCm = round1(benchmarkCm + shoe.offsetCm);
  const deltaCm = round1(garmentCm - targetCm);
  const inYour = `in your ${shoe.name.toLowerCase()}`;

  if (stretch === 'Super Stretch') {
    return {
      tone: 'unsure', targetCm, deltaCm,
      headline: 'No length verdict',
      subline: 'Stretch fabric, order as usual',
      badge: null, badgeTone: null,
    };
  }
  if (Math.abs(deltaCm) <= TOLERANCE_CM) {
    return {
      tone: 'fits', targetCm, deltaCm,
      headline: `Right length ${inYour}`,
      subline: 'No changes needed',
      badge: 'YOUR LENGTH', badgeTone: 'fits',
    };
  }
  if (deltaCm > 0) {
    return {
      tone: 'long', targetCm, deltaCm,
      headline: `${Math.round(deltaCm)} cm too long ${inYour}`,
      subline: `Hemming to ${Math.round(targetCm)} cm recommended`,
      badge: 'HEMMABLE TO YOURS', badgeTone: 'hemmable',
    };
  }
  return {
    tone: 'short', targetCm, deltaCm,
    headline: `${Math.abs(Math.round(deltaCm))} cm short ${inYour}`,
    subline: 'It will sit above the shoe. Cannot be lengthened',
    badge: null, badgeTone: 'short',
  };
}

/** The finished length the hem service would cut to. */
export function hemTargetCm({ benchmarkCm, shoe }) {
  return round1(benchmarkCm + shoe.offsetCm);
}

/** Best verdict across a garment's length options — used for catalog badges. */
export function bestVerdict(garment, { benchmarkCm, shoe }) {
  const rank = { fits: 0, long: 1, unsure: 2, short: 3 };
  let best = null;
  for (const len of garment.lengths) {
    const v = fitVerdict({ benchmarkCm, garmentCm: len.inseamCm, shoe, stretch: garment.stretch });
    if (!best || rank[v.tone] < rank[best.v.tone] ||
        (rank[v.tone] === rank[best.v.tone] && Math.abs(v.deltaCm) < Math.abs(best.v.deltaCm))) {
      best = { v, lengthLabel: len.label };
    }
  }
  return best;
}

const round1 = n => Math.round(n * 10) / 10;
