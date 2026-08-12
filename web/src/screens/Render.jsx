import React, { useEffect, useRef, useState } from 'react';

const STAGES = [
  { id: 'shoes_vto', label: 'Rendering your shoes on you (YouCam Shoes VTO)' },
  { id: 'verdict', label: 'Measuring the length against your benchmark' },
  { id: 'cloth_vto_shipped', label: 'Trying on the pants as shipped (YouCam Clothes VTO)' },
  { id: 'cloth_vto_hemmed', label: 'Trying on the pants hemmed to your length' },
];
const ORDER = STAGES.map(s => s.id);

export default function Render({ benchmark, garment, size, shoe, cached, onReady, onCheckout }) {
  const [job, setJob] = useState(cached ? { done: true } : null);
  const [data, setData] = useState(cached ?? null);
  const [error, setError] = useState(null);
  const pollRef = useRef();

  useEffect(() => {
    if (cached) return;
    let alive = true;
    fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        garmentId: garment.id, sizeLabel: size.label, shoeId: shoe.id,
        benchmarkCm: benchmark.cm, breakPref: benchmark.breakPref,
      }),
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(({ jobId, verdict, hemTargetCm }) => {
        if (!alive) return;
        const tick = async () => {
          const res = await fetch(`/api/render/${jobId}`).then(r => r.json());
          if (!alive) return;
          setJob(res);
          if (res.error) { setError(res.error); return; }
          if (res.done) {
            const full = { verdict, hemTargetCm, result: res.result };
            setData(full);
            onReady(full);
          } else {
            pollRef.current = setTimeout(tick, 700);
          }
        };
        setJob({ stage: 'shoes_vto', pct: 0, done: false });
        tick();
      })
      .catch(e => setError(String(e.message || e)));
    return () => { alive = false; clearTimeout(pollRef.current); };
  }, []);

  if (error) {
    return (
      <section className="screen">
        <h1>The render didn't finish</h1>
        <p className="error-note">{error}</p>
        <p className="lede">Your verdict math doesn't depend on the render — go back and retry, the result is cached once it succeeds.</p>
      </section>
    );
  }

  if (!data) {
    const activeIdx = job ? ORDER.indexOf(job.stage) : 0;
    return (
      <section className="screen">
        <h1>Checking the length…</h1>
        <p className="lede">Two YouCam renders and one measurement. Usually under a minute.</p>
        <div className="progress" aria-hidden="true"><b style={{ transform: `scaleX(${(job?.pct ?? 0) / 100})` }} /></div>
        <ol className="tasklist">
          {STAGES.map((s, i) => (
            <li key={s.id} className={i < activeIdx ? 'done' : i === activeIdx ? 'active' : ''}>
              <span className="dot" /> {s.label}
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const v = data.verdict;
  const delta = v.deltaCm;
  const needsHem = v.verdict === 'too_long';
  // Hem-line overlay positions (fraction of pane height): the "shipped" pane
  // shows where this garment's hem lands vs where it should; the hemmed pane
  // shows it corrected. Purely illustrative in mock mode.
  const idealTop = 88;
  const shippedTop = Math.min(91, idealTop + Math.max(-6, Math.min(8, delta * 0.9)));

  return (
    <section className="screen">
      <h1>{garment.name}, size {size.label}, with the {shoe.name}</h1>

      <div className={`verdict ${v.verdict}`} role="status">
        {v.message}
        <small>
          {needsHem
            ? `Hem target: ${data.hemTargetCm} cm — the render on the right shows that correction.`
            : v.verdict === 'too_short'
              ? 'A hem can shorten, not lengthen — consider the next size up.'
              : 'Ship it as is.'}
        </small>
      </div>

      <dl className="numbers">
        <div><dt>your length</dt><dd>{benchmark.cm} cm</dd></div>
        <div><dt>this garment</dt><dd>{size.outseamCm} cm</dd></div>
        <div><dt>heel</dt><dd>+{shoe.heelCm} cm</dd></div>
        <div><dt>difference</dt><dd>{delta > 0 ? '+' : ''}{delta} cm</dd></div>
      </dl>

      <div className="compare">
        <figure className="pane" style={{ margin: 0 }}>
          <img src={data.result.shippedImage} alt="Try-on render, garment as shipped" />
          <span className="tag">As shipped</span>
          {needsHem && (
            <span className="hemline-mark bad" style={{ top: `${shippedTop}%` }}>
              <span>+{delta} cm</span>
            </span>
          )}
        </figure>
        <figure className="pane" style={{ margin: 0 }}>
          <img src={data.result.hemmedImage} alt="Try-on render, garment hemmed to your length" />
          <span className="tag">{needsHem ? 'Hemmed for you' : 'Your fit'}</span>
          <span className="hemline-mark good" style={{ top: `${idealTop}%` }}>
            <span>{data.hemTargetCm} cm</span>
          </span>
        </figure>
      </div>

      {data.result.mock && (
        <p className="mock-note">
          Simulated render — live YouCam mode is off, so both panels show the base
          photo. The verdict math above is real.
        </p>
      )}

      <div className="cta-dock">
        <button className="btn" onClick={onCheckout}>
          {needsHem ? `Buy hemmed to ${data.hemTargetCm} cm` : 'Buy it'}
        </button>
      </div>
    </section>
  );
}
