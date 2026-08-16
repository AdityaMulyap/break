import React from "react";

/** Labelled row of options — "Waist", "Length", "Wash". Optional right-hand text link. */
export function SelectorRow({ label, value, action, onAction, children, style, ...rest }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-2)", ...style }} {...rest}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-3)" }}>
        <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>
          {label}{value ? <span style={{ color: "var(--text-primary)", letterSpacing: "var(--ls-normal)", textTransform: "none" }}>  {value}</span> : null}
        </span>
        {action ? <button type="button" onClick={onAction} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-small-role)", color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "3px" }}>{action}</button> : null}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--grid-gap)" }}>{children}</div>
    </div>
  );
}
