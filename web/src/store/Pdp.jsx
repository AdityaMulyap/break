import React from "react";
import { PhotoFrame, SelectorRow, SizeBox, WashSwatch, ModelStats, StickyBar, PluginRow } from "../ds";
import { Scroll, H1 } from "./Frame.jsx";

export function Pdp({ item, verdict, answered, onOpenVerdict, onAdd, waist, onWaist, len, onLen }) {
  const [wash, setWash] = React.useState(0);
  const [saved, setSaved] = React.useState(false);
  const [shot, setShot] = React.useState(0);

  // Gallery: the card shot plus two detail crops generated alongside it,
  // then the wash swatches as color tiles.
  const gallery = [item.image, item.image.replace(".jpg", "-d1.jpg"), item.image.replace(".jpg", "-d2.jpg")];
  const thumbs = [...gallery, ...item.washes.map(w => w.color)].slice(0, 5);

  return (
    <>
      <Scroll pad={false}>
        <PhotoFrame ratio="4 / 5" label={item.name.toUpperCase() + " · " + item.wash.toUpperCase()} src={gallery[shot]} alt={item.name} style={{ borderRadius: 0 }} />
        <div style={{ display: "flex", gap: "var(--space-2)", padding: "var(--space-2) var(--page-margin) 0" }}>
          {thumbs.map((t, i) => (
            <button key={i} type="button" onClick={t.startsWith("/") ? () => setShot(i) : undefined}
              aria-label={t.startsWith("/") ? `Photo ${i + 1}` : "Wash swatch"}
              style={{ width: 52, height: 52, borderRadius: 10, padding: 0, cursor: t.startsWith("/") ? "pointer" : "default", border: i === shot ? "1px solid var(--border-selected)" : "var(--hairline)", overflow: "hidden", flex: "0 0 auto", background: t.startsWith("#") ? t : "none" }}>
              {t.startsWith("/") ? <img src={t} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : null}
            </button>
          ))}
        </div>
        <div style={{ padding: "var(--space-5) var(--page-margin) var(--space-8)", display: "grid", gap: "var(--space-5)" }}>
          <div style={{ display: "grid", gap: "var(--space-2)", justifyItems: "start" }}>
            {item.bestseller || item.rating ? (
              <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                {item.bestseller ? <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", border: "var(--hairline)", borderRadius: 6, padding: "3px 8px", color: "var(--text-secondary)" }}>Bestseller</span> : null}
                {item.rating ? <span style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{"★".repeat(5)} {item.rating.stars} ({item.rating.count})</span> : null}
              </span>
            ) : null}
            <H1>{item.name}</H1>
            <span style={{ font: "var(--text-body-role)", color: "var(--text-secondary)" }}>{item.wash}</span>
            <span style={{ font: "var(--text-body-role)", color: "var(--text-primary)" }}>
              ${item.priceUsd}
              {item.compareAtUsd ? <span style={{ marginLeft: 8, color: "var(--text-muted)", textDecoration: "line-through" }}>${item.compareAtUsd}</span> : null}
            </span>
            <ModelStats>Model is 5'9", wearing 28 × {item.lengths[0].label}</ModelStats>
          </div>

          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>{item.stretch}</span>
            <div style={{ display: "flex", gap: "var(--grid-gap)" }}>
              {item.washes.map((w, i) => <WashSwatch key={w.name} color={w.color} name={w.name} selected={i === wash} onClick={() => setWash(i)} />)}
            </div>
          </div>

          <SelectorRow label="Waist" value={waist} action="Size guide">
            {item.waists.map(s => <SizeBox key={s} label={s} selected={waist === s} outOfStock={s === "34"} onClick={() => onWaist(s)} />)}
          </SelectorRow>

          <SelectorRow label="Length" value={len}>
            {item.lengths.map(l => <SizeBox key={l.label} label={l.label} selected={len === l.label} onClick={() => onLen(l.label)} />)}
          </SelectorRow>

          <PluginRow answered={answered ? verdict?.headline : undefined} tone={verdict?.tone === "unsure" ? "neutral" : verdict?.tone === "short" ? "long" : verdict?.tone} onClick={onOpenVerdict} />

          <div style={{ display: "grid", gap: "var(--space-3)", borderTop: "var(--hairline)", paddingTop: "var(--space-4)" }}>
            <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>Product details</span>
            {item.bullets?.length ? (
              <ul style={{ margin: 0, paddingLeft: "1.1em", display: "grid", gap: "var(--space-1)" }}>
                {item.bullets.map(b => <li key={b} style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)", textWrap: "pretty" }}>{b}</li>)}
              </ul>
            ) : (
              <p style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)", margin: 0, textWrap: "pretty" }}>{item.details}</p>
            )}
          </div>
        </div>
      </Scroll>
      <StickyBar saved={saved} onSave={() => setSaved(!saved)} onAction={onAdd} />
    </>
  );
}
