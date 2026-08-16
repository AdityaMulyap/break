import React from "react";

/** Measurement receipt in the store's size-chart register (dark header row). One measure, one unit. */
export function MeasureReceipt({ heading = "Length", unit = "cm", rows = [], note, style, ...rest }) {
  return (
    <div style={{ borderRadius: "var(--radius-plugin)", overflow: "hidden", border: "var(--hairline)", ...style }} {...rest}>
      <div style={{ display: "flex", justifyContent: "space-between", background: "var(--table-header-bg)", color: "var(--table-header-fg)", font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", padding: "var(--space-2) var(--space-3)" }}>
        <span>{heading}</span><span>{unit}</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "var(--text-primary)", padding: "var(--space-3)", borderTop: i ? "var(--hairline)" : "none", background: "var(--paper)" }}>
          <span>{r.label}</span><span style={{ fontWeight: "var(--fw-medium)" }}>{r.value}</span>
        </div>
      ))}
      {note ? <div style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)", padding: "var(--space-2) var(--space-3)", borderTop: "var(--hairline)", background: "var(--section)" }}>{note}</div> : null}
    </div>
  );
}
