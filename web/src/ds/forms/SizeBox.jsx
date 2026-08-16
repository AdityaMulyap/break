import React from "react";

/** One waist or length option. Square, utilitarian; out of stock is struck through. */
export function SizeBox({ label, selected = false, outOfStock = false, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={outOfStock ? undefined : onClick} aria-pressed={selected} style={{
      font: "var(--text-small-role)", color: outOfStock ? "var(--text-muted)" : "var(--text-primary)",
      background: "var(--paper)", cursor: outOfStock ? "default" : "pointer",
      border: selected ? "1px solid var(--border-selected)" : "var(--hairline)",
      boxShadow: selected ? "inset 0 0 0 1px var(--border-selected)" : "none",
      borderRadius: "var(--radius-store)", minWidth: "48px", height: "44px", padding: "0 var(--space-2)",
      textDecoration: outOfStock ? "line-through" : "none",
      transition: "border-color var(--dur-fast) var(--ease-standard)", ...style
    }} {...rest}>{label}</button>
  );
}
