import React from "react";

/** Break's single answer. Section-filled card, two rows of plain text, no border and no colour. */
export function VerdictCard({ headline, subline, style, ...rest }) {
  return (
    <div style={{ background: "var(--surface-verdict)", borderRadius: "var(--radius-plugin)", padding: "12px 14px", display: "grid", gap: "3px", ...style }} {...rest}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: "var(--fw-semibold)", lineHeight: 1.3, color: "var(--text-primary)" }}>{headline}</span>
      {subline ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "var(--fw-regular)", lineHeight: 1.35, color: "var(--text-secondary)" }}>{subline}</span> : null}
    </div>
  );
}
