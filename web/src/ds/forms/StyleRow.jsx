import React from "react";

// Same 48 x 52 grid as StyleCard, drawn small for list rows.
const SHAPES = {
  "tapered": { body: "M14 6H34L32 42H26L24.6 23.5H23.4L22 42H16Z", band: "M14.1 11H33.9" },
  "wide": { body: "M13 6H35L37 48H27L24.6 24H23.4L21 48H11Z", band: "M13.1 11H34.9" },
  "slim": { body: "M15 6H33L31.5 48H26.5L24.6 24H23.4L21.5 48H16.5Z", band: "M15.1 11H32.9" },
  "flare": { body: "M14.5 6H33.5L31 34L34 48H26.5L24.6 24H23.4L21.5 48H14L17 34Z", band: "M14.6 11H33.4" }
};

/** Style list row inside a brand: small silhouette, style name, fit word, chevron. */
export function StyleRow({ name, fit, shape = "tapered", selected = false, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} style={{
      width: "100%", height: "56px", display: "flex", alignItems: "center", gap: "var(--space-3)",
      background: "var(--paper)", border: selected ? "1px solid var(--ink)" : "var(--hairline)",
      borderRadius: "var(--radius-store)", padding: "0 var(--space-3)", cursor: "pointer",
      textAlign: "left", fontFamily: "var(--font-sans)", ...style
    }} {...rest}>
      <svg viewBox="9 3 30 48" width="17" height="27" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinejoin="round" style={{ flex: "0 0 auto" }} aria-hidden="true">
        <path d={SHAPES[shape].body} />
        <path d={SHAPES[shape].band} />
      </svg>
      <span style={{ flex: 1, fontSize: "14px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", minWidth: 0 }}>{name}</span>
      <span style={{ fontSize: "12px", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{fit}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 auto" }}><path d="M9 5l7 7-7 7" /></svg>
    </button>
  );
}
