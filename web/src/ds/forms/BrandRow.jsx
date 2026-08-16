import React from "react";

/** Benchmark search result: a brand, shown as a letter chip (never a logo). */
export function BrandRow({ brand, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: "100%", height: "56px", display: "flex", alignItems: "center", gap: "var(--space-3)",
      background: "var(--paper)", border: "none", borderBottom: "var(--hairline)", padding: "0 var(--space-1)",
      cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)", ...style
    }} {...rest}>
      <span style={{ width: 32, height: 32, flex: "0 0 auto", borderRadius: "var(--radius-pill)", background: "var(--section)", display: "grid", placeItems: "center", fontSize: "14px", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)" }}>{brand.charAt(0)}</span>
      <span style={{ flex: 1, fontSize: "14px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>{brand}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 auto" }}><path d="M9 5l7 7-7 7" /></svg>
    </button>
  );
}
