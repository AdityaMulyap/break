import React from "react";

/** "Sort by my fit" switch above the catalog grid. */
export function FitSortToggle({ on = false, onChange, label = "Sort by my fit", style, ...rest }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange && onChange(!on)} style={{
      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)",
      background: on ? "var(--accent-soft)" : "var(--section)", border: "none", borderRadius: "var(--radius-plugin)",
      padding: "var(--space-3) var(--space-4)", cursor: "pointer",
      transition: "background var(--dur-base) var(--ease-standard)", ...style
    }} {...rest}>
      <span style={{ display: "grid", gap: "2px", textAlign: "left" }}>
        <span style={{ font: "var(--text-small-role)", color: "var(--text-primary)" }}>{label}</span>
      </span>
      <span style={{ width: 42, height: 24, borderRadius: "var(--radius-pill)", background: on ? "var(--accent)" : "var(--border-hairline)", position: "relative", flex: "0 0 auto", transition: "background var(--dur-base) var(--ease-standard)" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: "var(--radius-pill)", background: "var(--paper)", transition: "left var(--dur-base) var(--ease-standard)" }} />
      </span>
    </button>
  );
}
