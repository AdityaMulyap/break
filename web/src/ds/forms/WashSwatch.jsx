import React from "react";

/** Denim wash swatch. Square, hairline; selected gets an offset indigo ring. */
export function WashSwatch({ color, name, selected = false, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} title={name} aria-pressed={selected} aria-label={name} style={{
      width: "40px", height: "40px", padding: 0, cursor: "pointer", background: color,
      border: "var(--hairline)", borderRadius: "var(--radius-store)",
      outline: selected ? "1px solid var(--accent)" : "none", outlineOffset: "2px", ...style
    }} {...rest} />
  );
}
