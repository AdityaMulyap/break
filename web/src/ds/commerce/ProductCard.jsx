import React from "react";
import { FitBadge } from "../core/FitBadge.jsx";
import { PhotoFrame } from "./PhotoFrame.jsx";

/** Catalog grid tile: photo with a save heart, wash dots, fit name, price (with optional compare-at), Break fit badge. */
export function ProductCard({ name, wash, price, compareAt, badge, src, dots, onClick, style, ...rest }) {
  const [saved, setSaved] = React.useState(false);
  return (
    <button type="button" onClick={onClick} style={{ display: "grid", gap: "var(--space-2)", textAlign: "left", background: "none", border: "none", padding: 0, cursor: "pointer", alignContent: "start", ...style }} {...rest}>
      <div style={{ position: "relative" }}>
        <PhotoFrame ratio="3 / 4" label={(wash || "PRODUCT").toUpperCase()} src={src} />
        {badge ? <div style={{ position: "absolute", left: "var(--space-2)", bottom: "var(--space-2)" }}><FitBadge>{badge}</FitBadge></div> : null}
        {/* Nested inside the card button, so it has to stop the click from opening the product. */}
        <span role="button" tabIndex={0} aria-label={saved ? "Saved" : "Save"} aria-pressed={saved}
          onClick={e => { e.stopPropagation(); setSaved(!saved); }}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setSaved(!saved); } }}
          style={{ position: "absolute", top: "var(--space-2)", right: "var(--space-2)", display: "grid", placeItems: "center", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "var(--ink)" : "none"} stroke="var(--ink)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.6-9-9c-1.2-2.7.6-6 3.8-6 2 0 3.4 1.2 5.2 3.2C13.8 6.2 15.2 5 17.2 5c3.2 0 5 3.3 3.8 6-2 4.4-9 9-9 9z" /></svg>
        </span>
      </div>
      <div style={{ display: "grid", gap: "5px" }}>
        {dots?.length ? (
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {dots.slice(0, 4).map(c => <span key={c} style={{ width: 13, height: 13, borderRadius: "var(--radius-pill)", background: c, border: "1px solid rgba(26,26,26,.15)" }} />)}
            {dots.length > 4 ? <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--text-secondary)", marginLeft: 2 }}>+{dots.length - 4}</span> : null}
          </span>
        ) : null}
        {/* Fixed two-line box so prices line up across the grid whether the name wraps or not. */}
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: "var(--fw-semibold)", color: "var(--text-primary)", textWrap: "pretty", minHeight: "2.6em" }}>{name}</span>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>
          {price}
          {compareAt ? <span style={{ marginLeft: 6, color: "var(--text-muted)", textDecoration: "line-through", fontWeight: "var(--fw-regular)" }}>{compareAt}</span> : null}
        </span>
      </div>
    </button>
  );
}
