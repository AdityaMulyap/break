import React, { useMemo, useState } from 'react';

const OWNED_PANTS = [
  { id: 'uniqlo', name: 'Uniqlo Smart Ankle Pant', brand: 'Uniqlo', gender: 'Men', size: '32', inseamCm: 66 },
  { id: 'levis', name: "Levi's 511 Slim", brand: "Levi's", gender: 'Men', size: '32', inseamCm: 68 },
  { id: 'zara', name: 'Zara Relaxed Chino', brand: 'Zara', gender: 'Women', size: 'M', inseamCm: 63 },
];

const GARMENT = { name: 'Wide Leg Trouser', size: 'S', lengthCm: 71 };

const SHOES = [
  { id: 'flats', label: 'Flats', allowanceCm: 0 },
  { id: 'sneakers', label: 'Sneakers', allowanceCm: 1 },
  { id: 'heels', label: 'Heels', allowanceCm: 3 },
];

export default function Finder() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('uniqlo');
  const [shoeId, setShoeId] = useState('flats');

  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return OWNED_PANTS;
    const hits = OWNED_PANTS.filter(p =>
      words.every(w => `${p.name} ${p.brand}`.toLowerCase().includes(w)));
    return hits.length ? hits : OWNED_PANTS;
  }, [query]);

  const selected = OWNED_PANTS.find(p => p.id === selectedId);
  const shoe = SHOES.find(s => s.id === shoeId);
  const diff = selected ? GARMENT.lengthCm - selected.inseamCm - shoe.allowanceCm : null;
  const shoeWord = shoe.label.toLowerCase();

  return (
    <main className="finder">
      <section className="finder-steps">
        <div className="step">
          <p className="step-label">Step 1</p>
          <div className="card">
            <h2>Which pants already fit you right?</h2>
            <p className="sub">Pick a pair you own. No tape measure.</p>

            <label className="search">
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <line x1="13.2" y1="13.2" x2="17" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Uniqlo smart ankle"
                aria-label="Search the pants you own"
              />
            </label>

            <ul className="results" role="listbox" aria-label="Your pants">
              {results.map(p => (
                <li key={p.id}>
                  <button
                    role="option"
                    aria-selected={p.id === selectedId}
                    className={p.id === selectedId ? 'hit selected' : 'hit'}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <strong>{p.name}</strong>
                    <span>{p.brand} · {p.gender} · size {p.size}</span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="foot">Can't find it? <a href="/">Measure it flat instead</a></p>
          </div>
        </div>

        <div className="step">
          <p className="step-label">Step 2</p>
          <div className="card">
            <h2>Your length is {selected.inseamCm} cm</h2>
            <p className="sub">Crotch seam to hem, from that pair.</p>

            <div className="illustration" role="img" aria-label={`Pants outline with the inseam marked from crotch to hem, ${selected.inseamCm} centimeters`}>
              <svg viewBox="0 0 200 250">
                <path
                  d="M66 18 h68 v16 h-68 Z
                     M66 34 h68 l12 196 h-34 l-12 -138 -12 138 h-34 Z"
                  fill="#fff" stroke="#b9b6b0" strokeWidth="2" strokeLinejoin="round"
                />
                <line x1="100" y1="92" x2="111" y2="230" stroke="#d84a3a" strokeWidth="2" strokeDasharray="5 4" />
                <circle cx="100" cy="92" r="4" fill="#d84a3a" />
                <circle cx="111" cy="230" r="4" fill="#d84a3a" />
              </svg>
            </div>

            <hr />

            <div className="worn-row">
              <span>Usually worn with</span>
              <span className="select-wrap">
                <select value={shoeId} onChange={e => setShoeId(e.target.value)} aria-label="Usually worn with">
                  {SHOES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </span>
            </div>
            <p className="helper">Shoe height changes the right hem, so we ask once.</p>
          </div>
        </div>

        <div className="step">
          <p className="step-label">Step 3</p>
          <div className="card">
            <h2>{GARMENT.name} · size {GARMENT.size}</h2>

            {diff > 0 && (
              <div className="banner long">
                <strong>{diff} cm too long</strong>
                <span>It will pool on the floor in {shoeWord}.</span>
              </div>
            )}
            {diff === 0 && (
              <div className="banner perfect">
                <strong>Perfect length</strong>
                <span>Hits right at the hem in {shoeWord}.</span>
              </div>
            )}
            {diff < 0 && (
              <div className="banner short">
                <strong>{-diff} cm too short</strong>
                <span>It will ride above your ankle in {shoeWord}.</span>
              </div>
            )}

            <dl className="spec">
              <div><dt>This garment</dt><dd>{GARMENT.lengthCm} cm</dd></div>
              <div><dt>Your length</dt><dd>{selected.inseamCm} cm</dd></div>
            </dl>

            <button className="hem-cta">
              <strong>Hem to {selected.inseamCm} cm before shipping</strong>
              <span>+$12 · adds 3 days</span>
            </button>

            <p className="see-link"><a href="/">See it hemmed on you</a></p>
          </div>
        </div>
      </section>

      <button
        className="scroll-down"
        aria-label="Scroll to the next section"
        onClick={() => document.getElementById('more')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <svg viewBox="0 0 16 10" aria-hidden="true"><path d="M1.5 1.5 8 8.5 14.5 1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>

      <section id="more" className="finder-more">
        <h2>Then see it on you</h2>
        <p>
          The full Break flow renders your shoes and the corrected garment on
          your own photo with two chained YouCam try-on calls — so the picture
          always agrees with the math above.
        </p>
        <a className="try-btn" href="/">Try the full flow</a>
      </section>
    </main>
  );
}
