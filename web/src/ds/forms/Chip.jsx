import React from "react";

/** Selectable chip — shoes, hem length, unit toggle. Plugin radius. */
export function Chip({ label, selected = false, recommended = false, filter = false, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} style={{
      font: "var(--text-small-role)",
      color: selected ? (filter ? "var(--accent)" : "var(--paper)") : "var(--text-primary)",
      background: selected && !filter ? "var(--accent)" : "var(--paper)",
      border: selected ? "1px solid var(--accent)" : "var(--hairline)",
      borderRadius: "var(--radius-plugin)", padding: "0 var(--space-4)", height: "44px",
      display: "inline-flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer",
      transition: "background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)", ...style
    }} {...rest}>
      {label}
      {recommended && !selected ? <span style={{ width: 5, height: 5, borderRadius: "var(--radius-pill)", background: "var(--accent)" }} /> : null}
    </button>
  );
}
