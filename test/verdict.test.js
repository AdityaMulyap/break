import test from 'node:test';
import assert from 'node:assert/strict';
import { verdict, hemTargetCm, TOLERANCE_CM } from '../lib/verdict.js';

test('garment matching benchmark with flat shoes fits', () => {
  const r = verdict({ benchmarkCm: 100, garmentCm: 100, heelCm: 0 });
  assert.equal(r.verdict, 'fits');
  assert.equal(r.deltaCm, 0);
});

test('5cm longer garment on flats is too long by 5', () => {
  const r = verdict({ benchmarkCm: 100, garmentCm: 105, heelCm: 0 });
  assert.equal(r.verdict, 'too_long');
  assert.equal(r.deltaCm, 5);
  assert.match(r.message, /5 cm too long/);
});

test('7cm heel absorbs a 7cm longer garment', () => {
  const r = verdict({ benchmarkCm: 100, garmentCm: 107, heelCm: 7 });
  assert.equal(r.verdict, 'fits');
});

test('same-length garment with 7cm heel is too short', () => {
  const r = verdict({ benchmarkCm: 100, garmentCm: 100, heelCm: 7 });
  assert.equal(r.verdict, 'too_short');
  assert.equal(r.deltaCm, -7);
});

test('break preference shifts the ideal by fixed offsets', () => {
  assert.equal(verdict({ benchmarkCm: 100, garmentCm: 98, breakPref: 'no_break' }).verdict, 'fits');
  assert.equal(verdict({ benchmarkCm: 100, garmentCm: 102, breakPref: 'full_break' }).verdict, 'fits');
  assert.equal(verdict({ benchmarkCm: 100, garmentCm: 102, breakPref: 'no_break' }).verdict, 'too_long');
});

test('tolerance band counts as fits at the edge', () => {
  const r = verdict({ benchmarkCm: 100, garmentCm: 100 + TOLERANCE_CM });
  assert.equal(r.verdict, 'fits');
  const over = verdict({ benchmarkCm: 100, garmentCm: 100 + TOLERANCE_CM + 0.1 });
  assert.equal(over.verdict, 'too_long');
});

test('deltas round to one decimal', () => {
  const r = verdict({ benchmarkCm: 100, garmentCm: 103.26 });
  assert.equal(r.deltaCm, 3.3);
  assert.match(r.message, /3\.3 cm too long/);
});

test('hemTargetCm returns ideal length for user + shoe', () => {
  assert.equal(hemTargetCm({ benchmarkCm: 100, heelCm: 7, breakPref: 'no_break' }), 105);
});

test('invalid inputs throw', () => {
  assert.throws(() => verdict({ benchmarkCm: -1, garmentCm: 100 }), RangeError);
  assert.throws(() => verdict({ benchmarkCm: 100, garmentCm: NaN }), RangeError);
  assert.throws(() => verdict({ benchmarkCm: 100, garmentCm: 100, breakPref: 'huge_break' }), RangeError);
});
