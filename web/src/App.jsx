import React, { useEffect, useState } from 'react';
import Measure from './screens/Measure.jsx';
import Catalog from './screens/Catalog.jsx';
import Shoes from './screens/Shoes.jsx';
import Render from './screens/Render.jsx';
import Checkout from './screens/Checkout.jsx';

// Shoes come before the catalog: heel height is what makes length
// computable, so the rack can show a live verdict on every size.
const STEPS = ['measure', 'shoes', 'catalog', 'render', 'checkout'];
const BENCH_KEY = 'hemline.benchmark';
const SESSION_KEY = 'hemline.session';

const readJson = (store, key) => {
  try { return JSON.parse(store.getItem(key)) ?? null; } catch { return null; }
};

export default function App() {
  const [benchmark, setBenchmark] = useState(() => readJson(localStorage, BENCH_KEY));
  // Picks survive an accidental (pull-to-)refresh via sessionStorage.
  const saved = readJson(sessionStorage, SESSION_KEY) ?? {};
  const [shoe, setShoe] = useState(saved.shoe ?? null);
  const [garment, setGarment] = useState(saved.garment ?? null);
  const [size, setSize] = useState(saved.size ?? null);
  const [step, setStep] = useState(() => {
    if (!benchmark) return 'measure';
    if (saved.step && STEPS.includes(saved.step) && saved.step !== 'render') return saved.step;
    if (saved.step === 'render' && saved.garment && saved.size && saved.shoe) return 'render';
    return 'shoes';
  });
  const [render, setRender] = useState(null); // { verdict, hemTargetCm, result }

  const stepIdx = STEPS.indexOf(step);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ step, shoe, garment, size }));
  }, [step, shoe, garment, size]);

  const saveBenchmark = b => {
    setBenchmark(b);
    localStorage.setItem(BENCH_KEY, JSON.stringify(b));
    setStep('shoes');
  };

  const back = () => {
    if (stepIdx > 0) setStep(STEPS[stepIdx - 1]);
  };

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  return (
    <div className="shell">
      <header className="topbar">
        {stepIdx > 0 && step !== 'checkout' && (
          <button className="back" onClick={back} aria-label="Back">‹</button>
        )}
        <span className="wordmark">Hemline</span>
        <span className="steps" aria-label={`Step ${stepIdx + 1} of ${STEPS.length}`}>
          {STEPS.map((s, i) => <i key={s} className={i <= stepIdx ? 'on' : ''} />)}
        </span>
      </header>

      {step === 'measure' && (
        <Measure initial={benchmark} onDone={saveBenchmark} />
      )}
      {step === 'shoes' && (
        <Shoes selected={shoe} onPick={sh => { setShoe(sh); setRender(null); setStep('catalog'); }} />
      )}
      {step === 'catalog' && (
        <Catalog
          selected={{ garment, size }}
          shoe={shoe}
          benchmark={benchmark}
          onPick={(g, s) => { setGarment(g); setSize(s); setRender(null); setStep('render'); }}
          onEditMeasure={() => setStep('measure')}
        />
      )}
      {step === 'render' && (
        <Render
          key={`${garment.id}-${size.label}-${shoe.id}`}
          benchmark={benchmark} garment={garment} size={size} shoe={shoe}
          cached={render}
          onReady={setRender}
          onCheckout={() => setStep('checkout')}
          onChangeSize={s => { setSize(s); setRender(null); }}
        />
      )}
      {step === 'checkout' && (
        <Checkout
          garment={garment} size={size} shoe={shoe} render={render}
          onBack={() => setStep('render')}
          onRestart={() => { setGarment(null); setSize(null); setRender(null); setStep('catalog'); }}
        />
      )}
    </div>
  );
}
