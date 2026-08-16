import React from "react";

/** Square store search input. Used for the benchmark search on onboarding. */
export function SearchField({ value, onChange, placeholder = "Search", disabled = false, style, ...rest }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", border: "var(--hairline)", borderRadius: "var(--radius-store)", background: "var(--paper)", padding: "0 var(--space-3)", height: "var(--tap-min)", opacity: disabled ? 0.5 : 1, ...style }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>
      <input value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{ border: "none", outline: "none", flex: 1, font: "var(--text-body-role)", color: "var(--text-primary)", background: "transparent", minWidth: 0 }} {...rest} />
    </div>
  );
}
