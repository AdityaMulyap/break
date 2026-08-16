import React from "react";

/** Smaller second-level chip under a ChipRow — heel height, boot shaft, etc. Text only. */
export function SubChip({ label, selected = false, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} style={{
      height: "28px", display: "inline-flex", alignItems: "center",
      padding: "0 var(--space-3)", cursor: "pointer", background: "var(--paper)",
      border: selected ? "1px solid var(--accent)" : "var(--hairline)", borderRadius: "var(--radius-plugin)",
      fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: "var(--fw-medium)", whiteSpace: "nowrap",
      color: selected ? "var(--accent)" : "var(--text-primary)",
      transition: "border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)", ...style
    }} {...rest}>{label}</button>
  );
}
