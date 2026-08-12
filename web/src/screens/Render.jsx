import React, { useEffect, useRef, useState } from 'react';

const STAGES = [
  { id: 'shoes_vto', label: 'Rendering your shoes on you (YouCam Shoes VTO)' },
  { id: 'verdict', label: 'Measuring the length against your saved length' },
  { id: 'cloth_vto_shipped', label: 'Trying on the pants as shipped (YouCam Clothes VTO)' },
  { id: 'cloth_vto_hemmed', label: 'Trying on the pants hemmed to your length' },
];
const ORDER = STAGES.map(s => s.id);

export default function Render({ benchmark, garment, size, shoe, cached, onReady, onCheckout, onChangeSize }) {
  const [job, setJob] = useState(cached ? { done: true } : null);
  const [data, setData] = useState(cached ?? null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const pollRef = useRef();

  useEffect(() => {
    if (cached) return;
    let alive = true;
    setError(null);
    setJob(null);
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
      .catch(() => setError('render-failed'));
    return () => { alive = false; clearTimeout(pollRef.current); };
  }, [attempt]);

  if (error) {
    return (
      <section className="screen">
        <h1>That render didn't finish</h1>
        <p className="lede">
          Nothing is lost — your measurement and picks are still here, and a
          successful render is saved for next time.
        </p>
        <button className="btn" onClick={() => setAttempt(a => a + 1)}>Try again</button>
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
  const tooLong = v.verdict === 'too_long';
  const tooShort = v.verdict === 'too_short';

  // The shoe+break allowance makes the receipt auditable:
  // garment − (your length + allowance) = difference.
  const allowance = Math.round((data.hemTargetCm - benchmark.cm) * 10) / 10;

  // Next-size suggestion when this one can't work (a hem only shortens).
  const betterSize = tooShort
    ? garment.sizes.reduce((best, s) =>
        Math.abs(s.outseamCm - data.hemTargetCm) < Math.abs(best.outseamCm - data.hemTargetCm) ? s : best)
    : null;
  const suggestSize = betterSize && betterSize.label !== size.label ? betterSize : null;

  // Hem-line overlay positions (fraction of pane height). Exaggerated enough
  // to read at a glance; the band marks the excess fabric to be removed.
  const idealTop = 84;
  const shippedTop = Math.min(93, idealTop + Math.max(-8, Math.min(9, delta * 1.8)));

  return (
    <section className="screen">
      <p className="context-line">{garment.name} · size {size.label} · {shoe.name}</p>

      <h1 className={`verdict-hero ${v.verdict}`} role="status">{v.message}</h1>
      <p className="verdict-sub">
        {tooLong && `Hem target: ${data.hemTargetCm} cm — the right panel shows that correction.`}
        {tooShort && 'A hem can shorten, not lengthen — this size can’t reach your line.'}
        {v.verdict === 'fits' && 'Ship it as is.'}
      </p>

      <dl className="numbers">
        <div style={{ '--i': 0 }}><dt>your length</dt><dd>{benchmark.cm} cm</dd></div>
        <div style={{ '--i': 1 }}><dt>this garment</dt><dd>{size.outseamCm} cm</dd></div>
        <div style={{ '--i': 2 }}><dt>shoe + break</dt><dd>{allowance > 0 ? '+' : ''}{allowance} cm</dd></div>
        <div style={{ '--i': 3 }}><dt>difference</dt><dd>{delta > 0 ? '+' : ''}{delta} cm</dd></div>
      </dl>

      {tooShort && suggestSize ? (
        <div className="suggest">
          <p>
            <strong>Size {suggestSize.label}</strong> is this garment's closest cut — {suggestSize.outseamCm} cm
            against your {data.hemTargetCm} cm target.
          </p>
          <button className="btn" onClick={() => onChangeSize(suggestSize)}>
            Check size {suggestSize.label} instead
          </button>
        </div>
      ) : tooShort ? (
        <div className="suggest">
          <p>
            Size {size.label} is this garment's longest cut and it still falls{' '}
            {Math.abs(delta)} cm short of your {data.hemTargetCm} cm target — this
            one isn't yours. Another garment on the rack might be.
          </p>
        </div>
      ) : (
        <div className="compare">
          <figure className="pane" style={{ margin: 0 }}>
            <img src={data.result.shippedImage} alt="Try-on render, garment as shipped" />
            <span className="tag">As shipped</span>
            {tooLong && (
              <>
                <span className="excess" style={{ top: `${idealTop}%`, height: `${shippedTop - idealTop}%` }} aria-hidden="true" />
                <span className="hemline-mark bad" style={{ top: `${shippedTop}%` }}>
                  <span>+{delta} cm</span>
                </span>
              </>
            )}
          </figure>
          <figure className="pane" style={{ margin: 0 }}>
            <img src={data.result.hemmedImage} alt="Try-on render, garment hemmed to your length" />
            <span className="tag accent">{tooLong ? 'Hemmed for you' : 'Your fit'}</span>
            <span className="hemline-mark good" style={{ top: `${idealTop}%` }}>
              <span>{data.hemTargetCm} cm</span>
            </span>
          </figure>
        </div>
      )}

      {data.result.mock && !tooShort && (
        <p className="mock-note">
          Simulated render — live YouCam mode is off, so both panels show the base
          photo. The verdict math above is real.
        </p>
      )}

      <div className="cta-dock">
        {tooShort ? (
          <button className="btn ghost" onClick={onCheckout}>Buy size {size.label} anyway</button>
        ) : (
          <button className="btn" onClick={onCheckout}>
            {tooLong ? `Buy hemmed to ${data.hemTargetCm} cm` : 'Buy it'}
          </button>
        )}
      </div>
    </section>
  );
}
