import React, { useEffect, useState } from 'react';
import Measure from './screens/Measure.jsx';
import Catalog from './screens/Catalog.jsx';
import Shoes from './screens/Shoes.jsx';
import Render from './screens/Render.jsx';
import Checkout from './screens/Checkout.jsx';

const STEPS = ['measure', 'catalog', 'shoes', 'render', 'checkout'];
const BENCH_KEY = 'hemline.benchmark';

export default function App() {
  const [benchmark, setBenchmark] = useState(() => {
    try { return JSON.parse(localStorage.getItem(BENCH_KEY)) ?? null; } catch { return null; }
  });
  const [step, setStep] = useState(benchmark ? 'catalog' : 'measure');
  const [garment, setGarment] = useState(null);
  const [size, setSize] = useState(null);
  const [shoe, setShoe] = useState(null);
  const [render, setRender] = useState(null); // { verdict, hemTargetCm, result }

  const stepIdx = STEPS.indexOf(step);

  const saveBenchmark = b => {
    setBenchmark(b);
    localStorage.setItem(BENCH_KEY, JSON.stringify(b));
    setStep('catalog');
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
      {step === 'catalog' && (
        <Catalog
          selected={{ garment, size }}
          onPick={(g, s) => { setGarment(g); setSize(s); setStep('shoes'); }}
          onEditMeasure={() => setStep('measure')}
          benchmark={benchmark}
        />
      )}
      {step === 'shoes' && (
        <Shoes onPick={sh => { setShoe(sh); setRender(null); setStep('render'); }} />
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
          onRestart={() => { setGarment(null); setSize(null); setShoe(null); setRender(null); setStep('catalog'); }}
        />
      )}
    </div>
  );
}
