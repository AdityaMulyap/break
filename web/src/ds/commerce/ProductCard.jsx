import React from "react";
import { FitBadge } from "../core/FitBadge.jsx";
import { PhotoFrame } from "./PhotoFrame.jsx";

/** Catalog grid tile: photo, wash dots, fit name, wash, price (with optional compare-at), Break fit badge. */
export function ProductCard({ name, wash, price, compareAt, badge, src, dots, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} style={{ display: "grid", gap: "var(--space-2)", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", alignContent: "start", ...style }} {...rest}>
      <div style={{ position: "relative" }}>
        <PhotoFrame ratio="3 / 4" label={(wash || "PRODUCT").toUpperCase()} src={src} />
        {badge ? <div style={{ position: "absolute", left: "var(--space-2)", bottom: "var(--space-2)" }}><FitBadge>{badge}</FitBadge></div> : null}
      </div>
      <div style={{ display: "grid", gap: "3px" }}>
        {dots?.length ? (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {dots.slice(0, 3).map(c => <span key={c} style={{ width: 8, height: 8, borderRadius: "var(--radius-pill)", background: c, border: "1px solid rgba(26,26,26,.15)" }} />)}
            {dots.length > 3 ? <span style={{ fontFamily: "var(--font-sans)", fontSize: 10, color: "var(--text-muted)" }}>+{dots.length - 3}</span> : null}
          </span>
        ) : null}
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)", minHeight: "2.8em", textWrap: "pretty" }}>{name}</span>
        {wash ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{wash}</span> : null}
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>
          {price}
          {compareAt ? <span style={{ marginLeft: 6, color: "var(--text-muted)", textDecoration: "line-through", fontWeight: "var(--fw-regular)" }}>{compareAt}</span> : null}
        </span>
      </div>
    </button>
  );
}
