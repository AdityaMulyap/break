import React from "react";
import { FitBadge } from "../core/FitBadge.jsx";
import { PhotoFrame } from "./PhotoFrame.jsx";

/** Catalog grid tile: photo, fit name, wash, price, optional Break fit badge. */
export function ProductCard({ name, wash, price, badge, src, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} style={{ display: "grid", gap: "var(--space-2)", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", ...style }} {...rest}>
      <div style={{ position: "relative" }}>
        <PhotoFrame ratio="3 / 4" label={(wash || "PRODUCT").toUpperCase()} src={src} />
        {badge ? <div style={{ position: "absolute", left: "var(--space-2)", bottom: "var(--space-2)" }}><FitBadge>{badge}</FitBadge></div> : null}
      </div>
      <div style={{ display: "grid", gap: "2px" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)" }}>{name}</span>
        {wash ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{wash}</span> : null}
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>{price}</span>
      </div>
    </button>
  );
}
