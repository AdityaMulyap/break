// Pure length math. No API, no I/O.
//
// Model: the user's benchmark pants fit them perfectly with flat shoes
// (heel ~0cm) at their preferred break. A candidate garment's effective
// length shifts by how much taller the shoe makes them (heel height) and
// by the difference between their preferred break and the benchmark's.
//
// deltaCm > 0  -> arrives too long by that much
// deltaCm < 0  -> arrives too short
// |deltaCm| <= TOLERANCE_CM -> fine as shipped

export const TOLERANCE_CM = 1.5;

// Fixed offsets relative to a half break, the neutral tailoring default.
export const BREAK_OFFSETS_CM = {
  no_break: -2,
  half_break: 0,
  full_break: 2,
};

/**
 * @param {Object} opts
 * @param {number} opts.benchmarkCm      user's own pants length (outseam), measured flat
 * @param {number} opts.garmentCm        catalog garment's published length in the chosen size
 * @param {number} [opts.heelCm=0]       heel height of the chosen shoe
 * @param {string} [opts.breakPref]      'no_break' | 'half_break' | 'full_break'
 * @returns {{ deltaCm: number, verdict: 'too_long'|'too_short'|'fits', message: string }}
 */
export function verdict({ benchmarkCm, garmentCm, heelCm = 0, breakPref = 'half_break' }) {
  for (const [name, v] of Object.entries({ benchmarkCm, garmentCm, heelCm })) {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) {
      throw new RangeError(`${name} must be a non-negative finite number, got ${v}`);
    }
  }
  if (!(breakPref in BREAK_OFFSETS_CM)) {
    throw new RangeError(`breakPref must be one of ${Object.keys(BREAK_OFFSETS_CM).join(', ')}`);
  }

  // Ideal length for this user with this shoe: their benchmark, plus the
  // heel lifting the hem line up (taller shoe -> can carry more length),
  // plus their break preference.
  const idealCm = benchmarkCm + heelCm + BREAK_OFFSETS_CM[breakPref];
  const deltaCm = round1(garmentCm - idealCm);

  if (Math.abs(deltaCm) <= TOLERANCE_CM) {
    return { deltaCm, verdict: 'fits', message: 'Arrives at your length with these shoes.' };
  }
  if (deltaCm > 0) {
    return {
      deltaCm,
      verdict: 'too_long',
      message: `Arrives ${fmt(deltaCm)} cm too long for you with these shoes.`,
    };
  }
  return {
    deltaCm,
    verdict: 'too_short',
    message: `Arrives ${fmt(-deltaCm)} cm too short for you with these shoes.`,
  };
}

/** Length the hem service should cut to — the ideal length for user + shoe. */
export function hemTargetCm({ benchmarkCm, heelCm = 0, breakPref = 'half_break' }) {
  return round1(benchmarkCm + heelCm + BREAK_OFFSETS_CM[breakPref]);
}

const round1 = n => Math.round(n * 10) / 10;
const fmt = n => (Number.isInteger(n) ? String(n) : n.toFixed(1));
