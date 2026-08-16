import React from "react";

/** The slim Break entry point under the PDP size selectors. */
export function PluginRow({ question = "Will these fit my length?", answered, tone = "fits", onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)",
      background: "var(--surface-plugin)", border: "var(--hairline)", borderRadius: "var(--radius-plugin)",
      padding: "var(--space-3) var(--space-4)", cursor: "pointer", textAlign: "left",
      boxShadow: "var(--shadow-plugin)", ...style
    }} {...rest}>
      <span style={{ display: "grid", gap: "3px" }}>
        <span style={{ font: "var(--text-body-role)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>{question}</span>
        {answered ? <span style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: tone === "long" ? "var(--state-warn-fg)" : tone === "neutral" ? "var(--state-neutral-fg)" : "var(--state-confirm-fg)" }}>{answered}</span> : null}
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 auto" }}><path d="M9 5l7 7-7 7" /></svg>
    </button>
  );
}
