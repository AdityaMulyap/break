import React from "react";
import { ProductCard, FitSortToggle, EmptyState, Shimmer, BreakMark, Button } from "../ds";
import { Scroll, H1, Sub } from "./Frame.jsx";
import { bestVerdict } from "../../../lib/fit.js";

export function Catalog({ catalog, fit, shoe, onOpen, onSetFit, onEditFit }) {
  const [sorted, setSorted] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [hemOnly, setHemOnly] = React.useState(false);

  function toggle(next) {
    if (next && !fit) { onSetFit(); return; }
    setSorted(next); setHemOnly(false);
    if (next) { setBusy(true); setTimeout(() => setBusy(false), 500); }
  }

  let items = catalog.map(i => ({
    ...i,
    best: fit ? bestVerdict(i, { benchmarkCm: fit.benchmarkCm, shoe }) : null,
  }));
  if (sorted && fit) {
    const rank = { fits: 0, hemmable: 1, short: 2, null: 3 };
    const tone = x => x.best?.v.badgeTone ?? (x.best?.v.tone === "unsure" ? null : x.best?.v.badgeTone);
    items = [...items].sort((a, b) =>
      (rank[tone(a)] ?? 3) - (rank[tone(b)] ?? 3) ||
      Math.abs(a.best?.v.deltaCm ?? 99) - Math.abs(b.best?.v.deltaCm ?? 99));
  }
  if (hemOnly) items = items.filter(i => i.best?.v.badgeTone === "hemmable");
  const none = sorted && items.length === 0;

  return (
    <Scroll>
      <div style={{ display: "grid", gap: "var(--space-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <H1>Women's jeans</H1>
          <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{items.length} styles</span>
        </div>

        {fit ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)" }}>
            <FitSortToggle on={sorted} onChange={toggle} />
            <button type="button" onClick={onEditFit} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-tiny-role)", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "3px", whiteSpace: "nowrap" }}>My fit</button>
          </div>
        ) : (
          <div style={{ background: "var(--section)", borderRadius: "var(--radius-plugin)", padding: "var(--space-4) var(--space-5)", display: "grid", gap: "var(--space-2)", justifyItems: "start" }}>
            <BreakMark fn="MY FIT" />
            <span style={{ font: "var(--text-small-role)", color: "var(--text-primary)" }}>Shop by your length</span>
            <Sub>Tell us one pair that fits. We rank the rack.</Sub>
            <Button variant="quiet" onClick={onSetFit}>Set my fit</Button>
          </div>
        )}

        {busy ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4) var(--space-3)" }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ display: "grid", gap: 8 }}>
                <Shimmer style={{ aspectRatio: "3 / 4", height: "auto" }} /><Shimmer width="70%" /><Shimmer width="40%" />
              </div>
            ))}
          </div>
        ) : none ? (
          <EmptyState title="Nothing in your length yet" body="Some items can be hemmed to yours." action="Show hemmable items" onAction={() => setHemOnly(true)} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6) var(--space-3)" }}>
            {items.map(i => (
              <ProductCard key={i.id} name={i.name} wash={i.wash} price={"$" + i.priceUsd} src={i.image}
                badge={sorted && i.best?.v.badge ? i.best.v.badge : undefined}
                onClick={() => onOpen(i)} />
            ))}
          </div>
        )}
      </div>
    </Scroll>
  );
}
