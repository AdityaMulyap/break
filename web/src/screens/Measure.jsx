import React, { useState } from 'react';

const BREAKS = [
  { id: 'no_break', label: 'No break', hint: 'Hem stops above the shoe. Cropped, deliberate.' },
  { id: 'half_break', label: 'Half break', hint: 'One soft fold on the shoe. The tailor default.' },
  { id: 'full_break', label: 'Full break', hint: 'Fabric stacks on the shoe. Relaxed, roomy.' },
];

export default function Measure({ initial, onDone }) {
  const [cm, setCm] = useState(initial?.cm ?? '');
  const [breakPref, setBreakPref] = useState(initial?.breakPref ?? 'half_break');
  const n = parseFloat(cm);
  const valid = Number.isFinite(n) && n >= 60 && n <= 140;

  return (
    <section className="screen">
      <h1>Measure the pants that already fit</h1>
      <p className="lede">
        Lay your favorite pair flat and measure the outseam — waistband to hem,
        along the side. One number, once. No body measurements.
      </p>

      <svg className="diagram" viewBox="0 0 300 190" role="img" aria-label="Diagram: pants lying flat with the outseam measured from waistband to hem along the outer edge">
        <rect x="70" y="20" width="120" height="34" rx="6" fill="oklch(0.934 0.008 262)" />
        <path d="M70 54 L64 170 h44 l14 -86 14 86 h44 L186 54 Z" fill="oklch(0.963 0.004 262)" stroke="oklch(0.885 0.006 262)" strokeWidth="1.5" />
        <line x1="40" y1="22" x2="40" y2="170" stroke="oklch(0.42 0.17 262)" strokeWidth="2" strokeDasharray="5 4" />
        <path d="M35 28 40 20 45 28 M35 162 40 170 45 162" fill="none" stroke="oklch(0.42 0.17 262)" strokeWidth="2" strokeLinecap="round" />
        <text x="24" y="102" fill="oklch(0.42 0.17 262)" fontSize="13" fontWeight="700" transform="rotate(-90 24 102)" textAnchor="middle">outseam</text>
      </svg>

      <label className="measure-row">
        <input
          type="number" inputMode="decimal" placeholder="104"
          min="60" max="140" step="0.5"
          value={cm} onChange={e => setCm(e.target.value)}
          aria-label="Outseam length in centimeters"
          autoFocus={!initial}
        />
        <span className="unit">cm</span>
      </label>
      <p className="hint">
        {cm !== '' && !valid
          ? 'That doesn’t look like a flat-measured outseam — most land between 95 and 115 cm.'
          : 'Most adult outseams land between 95 and 115 cm.'}
      </p>

      <h2>How do you like your hem to sit?</h2>
      <div className="seg" role="group" aria-label="Break preference">
        {BREAKS.map(b => (
          <button key={b.id} aria-pressed={breakPref === b.id} onClick={() => setBreakPref(b.id)}>
            {b.label}
          </button>
        ))}
      </div>
      <p className="hint" style={{ marginTop: 8 }}>{BREAKS.find(b => b.id === breakPref).hint}</p>

      <div className="cta-dock">
        <button className="btn" disabled={!valid} onClick={() => onDone({ cm: n, breakPref })}>
          {valid ? `Save ${n} cm as my length` : 'Enter your outseam to continue'}
        </button>
      </div>
    </section>
  );
}
