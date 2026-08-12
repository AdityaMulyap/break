import React, { useEffect, useState } from 'react';

export default function Catalog({ selected, onPick, onEditMeasure, benchmark }) {
  const [items, setItems] = useState(null);
  const [openId, setOpenId] = useState(selected.garment?.id ?? null);
  const [size, setSize] = useState(selected.size ?? null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/catalog')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setItems)
      .catch(e => setError(String(e.message || e)));
  }, []);

  const open = items?.find(g => g.id === openId) ?? null;

  return (
    <section className="screen">
      <h1>Pick something to try</h1>
      <p className="lede">
        A curated demo rack — every length below is the published outseam for
        that size. Your saved length:{' '}
        <strong>{benchmark.cm} cm</strong>{' '}
        <button className="linklike" onClick={onEditMeasure} style={{ border: 0, background: 'none', color: 'var(--primary)', font: 'inherit', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          edit
        </button>
      </p>

      {error && <p className="error-note">Couldn't load the catalog ({error}). Is the server running?</p>}
      {!items && !error && (
        <div className="stack" aria-hidden="true">
          {[0, 1, 2].map(i => <div key={i} className="row-card" style={{ height: 126, background: 'var(--surface)' }} />)}
        </div>
      )}

      <div className="stack">
        {items?.map(g => (
          <React.Fragment key={g.id}>
            <button
              className={`row-card${openId === g.id ? ' selected' : ''}`}
              aria-pressed={openId === g.id}
              onClick={() => { setOpenId(openId === g.id ? null : g.id); setSize(null); }}
            >
              <img src={g.image} alt="" loading="lazy" />
              <span className="meta">
                <span className="name">{g.name}</span>
                <span className="sub">{g.label} · lengths {g.sizes[0].outseamCm}–{g.sizes.at(-1).outseamCm} cm</span>
                <span className="price">${g.priceUsd}</span>
              </span>
            </button>
            {openId === g.id && (
              <div>
                <div className="chips" role="group" aria-label={`Sizes for ${g.name}`}>
                  {g.sizes.map(s => (
                    <button key={s.label} aria-pressed={size?.label === s.label} onClick={() => setSize(s)}>
                      {s.label}<span className="len">{s.outseamCm} cm</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="cta-dock">
        <button className="btn" disabled={!open || !size} onClick={() => onPick(open, size)}>
          {open && size ? `Continue with size ${size.label}` : 'Choose a garment and size'}
        </button>
      </div>
    </section>
  );
}
