import React from "react";

/** One line of an order summary. Set `total` for the emphasised final row. */
export function SummaryRow({ label, value, note, total = false, style, ...rest }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-4)", paddingTop: total ? "var(--space-3)" : 0, borderTop: total ? "var(--rule-strong)" : "none", ...style }} {...rest}>
      <span style={{ display: "grid", gap: "2px" }}>
        <span style={{ font: total ? "var(--text-small-role)" : "var(--text-small-role)", fontWeight: total ? "var(--fw-semibold)" : "var(--fw-regular)", color: "var(--text-primary)" }}>{label}</span>
        {note ? <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{note}</span> : null}
      </span>
      <span style={{ font: "var(--text-small-role)", fontWeight: total ? "var(--fw-semibold)" : "var(--fw-regular)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}
