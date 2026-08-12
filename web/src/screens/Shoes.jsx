import React, { useEffect, useState } from 'react';

export default function Shoes({ onPick }) {
  const [shoes, setShoes] = useState(null);
  const [sel, setSel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/shoes')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setShoes)
      .catch(e => setError(String(e.message || e)));
  }, []);

  return (
    <section className="screen">
      <h1>Which shoes will you wear them with?</h1>
      <p className="lede">
        Heel height moves the hem. The verdict — and the try-on render — use
        the exact shoe you pick here.
      </p>

      {error && <p className="error-note">Couldn't load shoes ({error}).</p>}

      <div className="stack">
        {shoes?.map(s => (
          <button
            key={s.id}
            className={`row-card${sel?.id === s.id ? ' selected' : ''}`}
            aria-pressed={sel?.id === s.id}
            onClick={() => setSel(s)}
          >
            <img src={s.image} alt="" loading="lazy" />
            <span className="meta">
              <span className="name">{s.name}</span>
              <span className="sub">heel {s.heelCm} cm</span>
            </span>
          </button>
        ))}
      </div>

      <div className="cta-dock">
        <button className="btn" disabled={!sel} onClick={() => onPick(sel)}>
          {sel ? `Check the length with the ${sel.name}` : 'Pick a shoe'}
        </button>
      </div>
    </section>
  );
}
