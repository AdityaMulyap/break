import React, { useEffect, useState } from 'react';
import { verdict } from '../../../lib/verdict.js';

// With the shoe already chosen, every size on the rack gets a live verdict.
const sizeVerdict = (s, benchmark, shoe) =>
  verdict({
    benchmarkCm: benchmark.cm,
    garmentCm: s.outseamCm,
    heelCm: shoe.heelCm,
    breakPref: benchmark.breakPref,
  });

const CHIP_NOTE = {
  fits: 'your length',
  too_long: 'hems to yours',
  too_short: 'runs short',
};

export default function Catalog({ selected, shoe, benchmark, onPick, onEditMeasure }) {
  const [items, setItems] = useState(null);
  const [openId, setOpenId] = useState(selected.garment?.id ?? null);
  const [size, setSize] = useState(selected.size ?? null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setError(null);
    fetch('/api/catalog')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setItems)
      .catch(() => setError(true));
  }, [attempt]);

  const open = items?.find(g => g.id === openId) ?? null;
  const openVerdict = open && size ? sizeVerdict(size, benchmark, shoe) : null;

  const bestNote = g => {
    const vs = g.sizes.map(s => sizeVerdict(s, benchmark, shoe).verdict);
    if (vs.includes('fits')) return { cls: 'ok', text: 'arrives at your length' };
    if (vs.includes('too_long')) return { cls: 'accent', text: 'hems to yours +$12' };
    return { cls: 'muted', text: 'runs short for you' };
  };

  return (
    <section className="screen">
      <h1>Pick something to try</h1>
      <p className="lede">
        A curated demo rack, measured against your{' '}
        <strong>{benchmark.cm} cm</strong>{' '}
        <button className="linklike" onClick={onEditMeasure}>edit</button>{' '}
        and the {shoe.name.toLowerCase()}.
      </p>

      {error && (
        <div className="error-note">
          <p>Couldn't load the rack. Check your connection and try again.</p>
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setAttempt(a => a + 1)}>
            Try again
          </button>
        </div>
      )}
      {!items && !error && (
        <div className="stack" aria-hidden="true">
          {[0, 1, 2].map(i => <div key={i} className="row-card" style={{ height: 126, background: 'var(--surface)' }} />)}
        </div>
      )}

      <div className="stack">
        {items?.map(g => {
          const note = bestNote(g);
          return (
            <React.Fragment key={g.id}>
              <button
                className={`row-card${openId === g.id ? ' selected' : ''}`}
                aria-pressed={openId === g.id}
                onClick={() => { setOpenId(openId === g.id ? null : g.id); setSize(null); }}
              >
                <img src={g.image} alt="" loading="lazy" />
                <span className="meta">
                  <span className="name">{g.name}</span>
                  <span className="sub">{g.label}</span>
                  <span className="price">
                    ${g.priceUsd}
                    <span className={`fit-badge ${note.cls}`}>{note.text}</span>
                  </span>
                </span>
              </button>
              {openId === g.id && (
                <div>
                  <div className="chips" role="group" aria-label={`Sizes for ${g.name}`}>
                    {g.sizes.map(s => {
                      const v = sizeVerdict(s, benchmark, shoe);
                      return (
                        <button
                          key={s.label}
                          className={v.verdict}
                          aria-pressed={size?.label === s.label}
                          aria-label={`Size ${s.label}, ${s.outseamCm} centimeters, ${CHIP_NOTE[v.verdict]}`}
                          onClick={() => setSize(s)}
                        >
                          {s.label}<span className="len">{CHIP_NOTE[v.verdict]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="cta-dock">
        <button className="btn" disabled={!open || !size} onClick={() => onPick(open, size)}>
          {open && size
            ? openVerdict.verdict === 'too_short'
              ? `Size ${size.label} runs short — see why`
              : `See it on you · size ${size.label}`
            : 'Choose a garment and size'}
        </button>
      </div>
    </section>
  );
}
