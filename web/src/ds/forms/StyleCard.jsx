import React from "react";

// 48 x 52 grid. Waist y=6, waistband y=11, crotch y=23-24, full-length hem y=48.
const SHAPES = {
  // tapered: narrows steadily, hem stops short of the ankle at y=42
  "tapered": { body: "M14 6H34L32 42H26L24.6 23.5H23.4L22 42H16Z", band: "M14.1 11H33.9" },
  // wide: leg width constant and wide from hip to hem
  "wide": { body: "M13 6H35L37 48H27L24.6 24H23.4L21 48H11Z", band: "M13.1 11H34.9" },
  // slim: narrow through the whole leg, full length
  "slim": { body: "M15 6H33L31.5 48H26.5L24.6 24H23.4L21.5 48H16.5Z", band: "M15.1 11H32.9" },
  // flare: fitted to the knee at y=34, then a visible outward kick
  "flare": { body: "M14.5 6H33.5L31 34L34 48H26.5L24.6 24H23.4L21.5 48H14L17 34Z", band: "M14.6 11H33.4" }
};

/** Selectable style card in the benchmark picker: line-drawn silhouette, name, fit word. */
export function StyleCard({ name, fit, shape = "tapered", selected = false, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} style={{
      display: "grid", gap: "var(--space-2)", justifyItems: "center", cursor: "pointer",
      background: "var(--paper)", border: selected ? "1px solid var(--ink)" : "var(--hairline)",
      borderRadius: "var(--radius-store)", padding: "var(--space-3)", fontFamily: "var(--font-sans)", ...style
    }} {...rest}>
      <svg viewBox="9 3 30 48" width="52" height="83" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
        <path d={SHAPES[shape].body} />
        <path d={SHAPES[shape].band} />
      </svg>
      <span style={{ display: "grid", gap: "1px", justifyItems: "center" }}>
        <span style={{ fontSize: "13px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>{name}</span>
        <span style={{ fontSize: "11px", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{fit}</span>
      </span>
    </button>
  );
}
