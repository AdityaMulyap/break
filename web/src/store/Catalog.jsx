import React from "react";
import { ProductCard, FitSortToggle, EmptyState, Shimmer, Button } from "../ds";
import { Scroll, H1, Sub } from "./Frame.jsx";
import { bestVerdict } from "../../../lib/fit.js";

const CARD_KEY = "break.lengthCardDismissed";

export function Catalog({ catalog, fit, shoe, onOpen, onSetFit, onEditFit }) {
  const [sorted, setSorted] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [hemOnly, setHemOnly] = React.useState(false);
  const [cardGone, setCardGone] = React.useState(() => localStorage.getItem(CARD_KEY) === "1");
  const dismissCard = () => { localStorage.setItem(CARD_KEY, "1"); setCardGone(true); };

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

        <div style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto", margin: "0 calc(-1 * var(--page-margin))", padding: "0 var(--page-margin)" }}>
          {["My fit", "Filter", "Leg Shape", "Rise", "Wash"].map((c, i) => (
            <button key={c} type="button" onClick={c === "My fit" ? (fit ? onEditFit : onSetFit) : undefined}
              style={{ font: "var(--text-small-role)", padding: "10px 14px", whiteSpace: "nowrap", cursor: c === "My fit" ? "pointer" : "default", border: "var(--hairline)", borderRadius: "var(--radius-pill)", background: "var(--paper)", color: i === 0 ? "var(--accent)" : "var(--text-secondary)" }}>{c}</button>
          ))}
        </div>

        {fit ? (
          <FitSortToggle on={sorted} onChange={toggle} />
        ) : cardGone ? null : (
          <div style={{ position: "relative", background: "var(--accent-soft)", borderRadius: "var(--radius-plugin)", padding: "var(--space-4) var(--space-5)", display: "grid", gap: "var(--space-2)", justifyItems: "start" }}>
            <button type="button" aria-label="Dismiss" onClick={dismissCard} style={{ position: "absolute", top: 8, right: 8, width: 32, height: 32, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16 }}>×</button>
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
              <ProductCard key={i.id} name={i.name.split(" in ")[0]} wash={i.wash} price={"$" + i.priceUsd}
                compareAt={i.compareAtUsd ? "$" + i.compareAtUsd : undefined}
                dots={i.washes.map(w => w.color)} src={i.image}
                badge={sorted && i.best?.v.badge ? i.best.v.badge : undefined}
                onClick={() => onOpen(i)} />
            ))}
          </div>
        )}
      </div>
    </Scroll>
  );
}
