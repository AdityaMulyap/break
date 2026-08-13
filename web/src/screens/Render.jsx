import React, { useEffect, useRef, useState } from 'react';

const ALL_STAGES = [
  { id: 'shoes_vto', label: 'Rendering your shoes on you (YouCam Shoes VTO)' },
  { id: 'verdict', label: 'Measuring the length against your saved length' },
  { id: 'cloth_vto_shipped', label: 'Trying on the pants as shipped (YouCam Clothes VTO)' },
  { id: 'cloth_vto_hemmed', label: 'Trying on the pants hemmed to your length' },
];

export default function Render({ benchmark, garment, size, shoe, cached, onReady, onCheckout, onChangeSize }) {
  const [job, setJob] = useState(cached ? { done: true } : null);
  const [data, setData] = useState(cached ?? null);
  const [verdictKind, setVerdictKind] = useState(cached?.verdict?.verdict ?? null);
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
        setVerdictKind(verdict.verdict);
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
        <p className="lede">Your measurement and picks are safe — give it another go.</p>
        <button className="btn" onClick={() => setAttempt(a => a + 1)}>Try again</button>
      </section>
    );
  }

  if (!data) {
    // An unfixable size skips the two clothes renders; show the honest plan.
    const stages = verdictKind === 'too_short' ? ALL_STAGES.slice(0, 2) : ALL_STAGES;
    const order = stages.map(s => s.id);
    const activeIdx = job ? order.indexOf(job.stage) : 0;
    const pct = job?.pct ?? 0;
    return (
      <section className="screen">
        <h1>Checking the length…</h1>
        <p className="lede">
          {stages.length === 2
            ? 'One YouCam render and one measurement.'
            : 'Two YouCam renders and one measurement. Usually under a minute.'}
        </p>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Render progress">
          <b style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <ol className="tasklist">
          {stages.map((s, i) => (
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
  const fits = v.verdict === 'fits';

  // The shoe+break allowance makes the receipt auditable:
  // garment − (your length + allowance) = difference.
  const allowance = Math.round((data.hemTargetCm - benchmark.cm) * 10) / 10;

  // Suggest only sizes a hem can actually reach (long enough to cut down).
  const reachable = garment.sizes.filter(s => s.outseamCm >= data.hemTargetCm - 1.5);
  const suggestSize = tooShort && reachable.length
    ? reachable.reduce((a, b) => (a.outseamCm <= b.outseamCm ? a : b))
    : null;

  const idealTop = 84;
  const shippedTop = Math.min(93, idealTop + Math.max(-8, Math.min(9, delta * 1.8)));
  const synthetic = data.result.mock; // mock renders get a deliberate diagram treatment

  return (
    <section className="screen">
      <p className="context-line">{garment.name} · size {size.label} · {shoe.name}</p>

      <h1 className={`verdict-hero ${v.verdict}`} role="status">{v.message}</h1>
      <p className="verdict-sub">
        {tooLong && `Hem target: ${data.hemTargetCm} cm — the right panel shows that correction.`}
        {tooShort && 'A hem can shorten, not lengthen — this size can’t reach your line.'}
        {fits && 'Ship it as is.'}
      </p>

      <dl className="numbers">
        <div style={{ '--i': 0 }}><dt>your length</dt><dd>{benchmark.cm} cm</dd></div>
        <div style={{ '--i': 1 }}><dt>this garment</dt><dd>{size.outseamCm} cm</dd></div>
        <div style={{ '--i': 2 }}><dt>shoe + break</dt><dd>{allowance > 0 ? '+' : ''}{allowance} cm</dd></div>
        <div style={{ '--i': 3 }}><dt>difference</dt><dd>{delta > 0 ? '+' : ''}{delta} cm</dd></div>
      </dl>
      <p className="hint receipt-note">
        shoe + break = heel lift {shoe.heelCm} cm {allowance - shoe.heelCm >= 0 ? '+' : '−'} {Math.abs(Math.round((allowance - shoe.heelCm) * 10) / 10)} cm for your{' '}
        {benchmark.breakPref.replace('_', ' ')} — so this garment needs to be {data.hemTargetCm} cm for you.
      </p>

      {tooShort ? (
        <>
          <div className="compare single">
            <figure className={`pane${synthetic ? ' synthetic' : ''}`} style={{ margin: 0 }}>
              <img src={data.result.baseImage} alt="Your chosen shoes rendered on your photo" />
              <span className="tag">Your shoes, rendered</span>
              <span className="hemline-mark good" style={{ top: `${idealTop}%` }}>
                <span>{data.hemTargetCm} cm</span>
              </span>
              {synthetic && <span className="preview-chip">preview</span>}
            </figure>
            <div className="suggest">
              {suggestSize ? (
                <>
                  <p>
                    <strong>Size {suggestSize.label}</strong> is the shortest cut a hem can
                    reach — {suggestSize.outseamCm} cm against your {data.hemTargetCm} cm target.
                  </p>
                  <button className="btn" onClick={() => onChangeSize(suggestSize)}>
                    Check size {suggestSize.label} instead
                  </button>
                </>
              ) : (
                <p>
                  {(() => {
                    const longest = garment.sizes.reduce((a, b) => (a.outseamCm >= b.outseamCm ? a : b));
                    return `None of this garment's cuts reach your ${data.hemTargetCm} cm target — the longest (size ${longest.label}, ${longest.outseamCm} cm) still falls ${Math.round((data.hemTargetCm - longest.outseamCm) * 10) / 10} cm short. Another garment on the rack might be yours.`;
                  })()}
                </p>
              )}
            </div>
          </div>
        </>
      ) : fits ? (
        <div className="compare single">
          <figure className={`pane${synthetic ? ' synthetic' : ''}`} style={{ margin: 0 }}>
            <img src={data.result.hemmedImage} alt="Try-on render at your length" />
            <span className="tag accent">Your fit, as shipped</span>
            <span className="hemline-mark good" style={{ top: `${idealTop}%` }}>
              <span>{data.hemTargetCm} cm</span>
            </span>
            {synthetic && <span className="preview-chip">preview</span>}
          </figure>
        </div>
      ) : (
        <div className="compare">
          <figure className={`pane${synthetic ? ' synthetic' : ''}`} style={{ margin: 0 }}>
            <img src={data.result.shippedImage} alt="Try-on render, garment as shipped" />
            <span className="tag">As shipped</span>
            <span className="excess" style={{ top: `${idealTop}%`, height: `${shippedTop - idealTop}%` }} aria-hidden="true" />
            <span className="hemline-mark bad" style={{ top: `${shippedTop}%` }}>
              <span>+{delta} cm</span>
            </span>
          </figure>
          <figure className={`pane${synthetic ? ' synthetic' : ''}`} style={{ margin: 0 }}>
            <img src={data.result.hemmedImage} alt="Try-on render, garment hemmed to your length" />
            <span className="tag accent">Hemmed for you</span>
            <span className="hemline-mark good" style={{ top: `${idealTop}%` }}>
              <span>{data.hemTargetCm} cm</span>
            </span>
            {synthetic && <span className="preview-chip">preview</span>}
          </figure>
        </div>
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
