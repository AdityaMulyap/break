import React from "react";

/** Nothing-here state. White hairline card; always offers the next move. */
export function EmptyState({ title, body, action, onAction, style, ...rest }) {
  return (
    <div style={{ background: "var(--paper)", border: "var(--hairline)", borderRadius: "var(--radius-plugin)", padding: "12px 14px", display: "grid", gap: "3px", justifyItems: "start", ...style }} {...rest}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: "var(--fw-semibold)", lineHeight: 1.3, color: "var(--text-primary)" }}>{title}</span>
      {body ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "var(--fw-regular)", lineHeight: 1.35, color: "var(--text-secondary)" }}>{body}</span> : null}
      {action ? <button type="button" onClick={onAction} style={{ marginTop: "var(--space-1)", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "var(--fw-medium)", color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "3px" }}>{action}</button> : null}
    </div>
  );
}
