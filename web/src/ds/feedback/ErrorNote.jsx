import React from "react";

/** Recoverable error. White hairline card, plain sentence plus a retry link — no color, no alarm. */
export function ErrorNote({ title, children, action, onAction, style, ...rest }) {
  return (
    <div style={{ background: "var(--paper)", border: "var(--hairline)", borderRadius: "var(--radius-plugin)", padding: "12px 14px", display: "flex", gap: "var(--space-4)", alignItems: "center", ...style }} {...rest}>
      <span style={{ display: "grid", gap: "3px", flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: "var(--fw-semibold)", lineHeight: 1.3, color: "var(--text-primary)" }}>{title}</span>
        {children ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "var(--fw-regular)", lineHeight: 1.35, color: "var(--text-secondary)" }}>{children}</span> : null}
      </span>
      {action ? <button type="button" onClick={onAction} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "var(--fw-medium)", color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "3px", whiteSpace: "nowrap", flex: "0 0 auto" }}>{action}</button> : null}
    </div>
  );
}
