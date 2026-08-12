import React, { useState } from 'react';

const HEM_PRICE = 12;

export default function Checkout({ garment, size, shoe, render, onBack, onRestart }) {
  const needsHem = render?.verdict?.verdict === 'too_long';
  const [hemOn, setHemOn] = useState(needsHem);
  const [placed, setPlaced] = useState(false);

  const total = garment.priceUsd + (hemOn ? HEM_PRICE : 0);

  if (placed) {
    return (
      <section className="screen">
        <div className="confirm">
          <div className="check" aria-hidden="true">✓</div>
          <h1>Order placed — in the demo sense</h1>
          <p className="lede" style={{ margin: '10px auto 26px' }}>
            Nothing was charged and nothing ships. What you just saw is the point:
            the try-on told you how it looks, Hemline told you how it will arrive.
          </p>
          <button className="btn ghost" onClick={onRestart}>Try another garment</button>
        </div>
      </section>
    );
  }

  return (
    <section className="screen">
      <h1>Checkout</h1>
      <p className="lede">{garment.name} · size {size.label} · worn with the {shoe.name}</p>

      <div className="order">
        <div className="line">
          <span className="l">{garment.name}<small>{garment.label}</small></span>
          <span className="amt">${garment.priceUsd}</span>
        </div>
        <div className={`line${hemOn ? ' hem-line' : ''}`}>
          <span className="l">
            Hem to your length ({render.hemTargetCm} cm)
            <small>{hemOn ? 'Ships in 2 extra days' : needsHem ? `Skipping — arrives +${render.verdict.deltaCm} cm long` : 'Not needed for this size'}</small>
          </span>
          <label className="switch">
            <input
              type="checkbox" checked={hemOn}
              onChange={e => setHemOn(e.target.checked)}
              aria-label="Add hem-to-length service"
            />
            <span className="track" />
          </label>
          <span className="amt">{hemOn ? `+$${HEM_PRICE}` : '$0'}</span>
        </div>
        <div className="line total">
          <span className="l">Total</span>
          <span className="amt">${total}</span>
        </div>
      </div>

      <div className="cta-dock">
        <button className="btn" onClick={() => setPlaced(true)}>
          Place order · ${total}
        </button>
        <button className="btn ghost" style={{ marginTop: 8 }} onClick={onBack}>
          Back to the render
        </button>
      </div>
    </section>
  );
}
