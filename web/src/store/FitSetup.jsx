import React from "react";
import { SearchField, Button, EmptyState, Shimmer, BrandRow, StyleRow, SizeBox, ChipRow, BreakMark, PantsDiagram } from "../ds";

const HEIGHTS = ['Under 5\'3"', '5\'3" to 5\'9"', '5\'9" to 6\'1"', 'Over 6\'1"'];
import { H1, Sub } from "./Frame.jsx";

// First-run Break setup: pick the benchmark pair, then the usual shoes.
// Rendered inside the Length Check sheet on the PDP, and as a full screen
// from the catalog's "Set my fit" card. Same component both places.
export function FitSetup({ benchmarks, shoes, initialShoe = "sneakers", onDone, compact = false }) {
  const [q, setQ] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [brand, setBrand] = React.useState(null);
  const [style, setStyle] = React.useState(null);
  const [size, setSize] = React.useState(null);
  const [height, setHeight] = React.useState(HEIGHTS[1]);
  const [shoeId, setShoeId] = React.useState(initialShoe);
  const [styleQ, setStyleQ] = React.useState("");
  const [noMatch, setNoMatch] = React.useState(false);
  const timer = React.useRef();

  const brands = benchmarks.brands;

  function settle(fn) {
    setBusy(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setBusy(false); fn(); }, 450);
  }

  function pickBrand(b) {
    setQ(""); setNoMatch(false);
    settle(() => setBrand(b));
  }

  function search(v) {
    setQ(v); setBrand(null); setStyle(null); setSize(null);
    if (!v.trim()) { setNoMatch(false); setBusy(false); clearTimeout(timer.current); return; }
    settle(() => {
      const hit = brands.find(b => b.name.toLowerCase().startsWith(v.toLowerCase().trim()));
      if (hit) setBrand(hit); else setNoMatch(true);
    });
  }

  const sizes = style ? Object.keys(style.sizes) : [];
  const ready = brand && style && size;

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        {compact ? null : <BreakMark fn="MY FIT" />}
        <H1 style={compact ? { fontSize: 18 } : undefined}>Which pants already fit you right?</H1>
        <Sub>Pick a pair you own. No tape measure.</Sub>
      </div>

      <SearchField value={q} onChange={e => search(e.target.value)} placeholder="Brand you own, e.g. Uniqlo" />

      {busy ? (
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <Shimmer height="56px" /><Shimmer height="56px" />
        </div>
      ) : noMatch ? (
        <EmptyState title="No match for that one" body="Some brands are not in our library yet."
          action="Show the brands we know" onAction={() => { setQ(""); setNoMatch(false); }} />
      ) : !brand ? (
        <div style={{ display: "grid", gap: "var(--space-1)" }}>
          <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>Popular</span>
          {brands.map(b => <BrandRow key={b.name} brand={b.name} onClick={() => pickBrand(b)} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", paddingBottom: "var(--space-3)", borderBottom: "var(--hairline)" }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>{brand.name}</span>
            <button type="button" onClick={() => { setBrand(null); setStyle(null); setSize(null); setQ(""); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: "var(--fw-medium)", color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "3px" }}>Change</button>
          </div>

          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            <SearchField value={styleQ} onChange={e => setStyleQ(e.target.value)} placeholder={`Search ${brand.name} styles`} />
            <div style={{ display: "grid" }}>
              {brand.styles.filter(s => s.name.toLowerCase().includes(styleQ.toLowerCase().trim())).map(s => (
                <StyleRow key={s.name} name={s.name}
                  fit={s.name.toLowerCase().includes(s.fit.toLowerCase()) ? undefined : s.fit}
                  shape={s.shape} selected={style?.name === s.name} onClick={() => { setStyle(s); setSize(null); }} />
              ))}
            </div>
          </div>

          {style ? (
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>Your size</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--grid-gap)" }}>
                {sizes.map(s => <SizeBox key={s} label={s} selected={size === s} onClick={() => setSize(s)} />)}
              </div>
            </div>
          ) : null}

          {style && size ? (
            <ChipRow label="Your height" options={HEIGHTS} value={height} onChange={setHeight} />
          ) : null}

          {ready ? (
            <ChipRow label="Usually worn with" help="Shoe height changes the right hem, so we ask once." options={shoes.map(s => ({ value: s.id, label: s.name }))} value={shoeId} onChange={setShoeId} />
          ) : null}

          <Button full plugin={compact} disabled={!ready} onClick={() => onDone({
            brand: brand.name,
            styleName: style.name,
            sizeLabel: size,
            benchmarkCm: style.sizes[size],
            height,
            shoeId,
          })}>That's my pair</Button>
        </div>
      )}
    </div>
  );
}

/** Post-setup confirmation: the fit, stated back once. */
export function FitConfirm({ fit, itemName, onContinue, compact = false }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        {compact ? null : <BreakMark fn="MY FIT" />}
        <H1 style={compact ? { fontSize: 18 } : undefined}>Your fit is set</H1>
      </div>
      <div style={{ background: "var(--section)", borderRadius: "var(--radius-plugin)", padding: "var(--space-5)", display: "flex", gap: "var(--space-4)", alignItems: "center" }}>
        <PantsDiagram highlight="inseam" width="72px" />
        <div style={{ display: "grid", gap: "2px" }}>
          <span style={{ font: "var(--text-small-role)", color: "var(--text-primary)" }}>{fit.brand} {fit.styleName}, {fit.sizeLabel}</span>
          <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>Your length: {Math.round(fit.benchmarkCm)} cm</span>
          <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-muted)" }}>From that pair's published measurements</span>
        </div>
      </div>
      <Button full plugin={compact} onClick={onContinue}>{itemName ? `Check ${itemName}` : "Start shopping"}</Button>
    </div>
  );
}
