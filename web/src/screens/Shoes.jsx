import React, { useEffect, useState } from 'react';

export default function Shoes({ selected, onPick }) {
  const [shoes, setShoes] = useState(null);
  const [sel, setSel] = useState(selected ?? null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setError(null);
    fetch('/api/shoes')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setShoes)
      .catch(() => setError(true));
  }, [attempt]);

  return (
    <section className="screen">
      <h1>Which shoes will you wear them with?</h1>
      <p className="lede">
        Heel height moves the hem, so the shoe comes first — the rack you're
        about to see is measured against it.
      </p>

      {error && (
        <div className="error-note">
          <p>Couldn't load the shoes. Check your connection and try again.</p>
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setAttempt(a => a + 1)}>
            Try again
          </button>
        </div>
      )}

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
          {sel ? `Browse the rack with the ${sel.name}` : 'Pick a shoe'}
        </button>
      </div>
    </section>
  );
}
