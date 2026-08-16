import React from "react";

/** Schematic flat-lay pants with the measured line highlighted. Line art, not illustration. */
export function PantsDiagram({ highlight = "inseam", caption, width = "100%", style, ...rest }) {
  const on = k => highlight === k ? "var(--accent)" : "var(--border-hairline)";
  const w = k => highlight === k ? 2 : 1;
  return (
    <div style={{ display: "grid", gap: "var(--space-2)", justifyItems: "center", ...style }} {...rest}>
      <svg viewBox="0 0 120 160" width={width} style={{ maxWidth: 180 }} fill="none" aria-label="Flat pants diagram">
        <path d="M20 8h80l6 144H72L60 70 48 152H14z" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M20 8h80" stroke={on("waist")} strokeWidth={w("waist")} />
        <path d="M60 70v82" stroke={on("inseam")} strokeWidth={w("inseam")} strokeDasharray={highlight === "inseam" ? "0" : "3 3"} />
        <path d="M14 152h34" stroke={on("hem")} strokeWidth={w("hem")} />
        <path d="M72 152h34" stroke={on("hem")} strokeWidth={w("hem")} />
      </svg>
      {caption ? <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)", textAlign: "center" }}>{caption}</span> : null}
    </div>
  );
}
