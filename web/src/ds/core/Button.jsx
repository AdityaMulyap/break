import React from "react";

const base = {
  fontFamily: "var(--font-sans)", fontSize: "var(--fs-body)", fontWeight: "var(--fw-semibold)",
  lineHeight: 1, letterSpacing: "var(--ls-normal)", borderRadius: "var(--radius-pill)",
  minHeight: "var(--tap-min)", padding: "0 var(--space-5)", cursor: "pointer",
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)",
  transition: "background var(--dur-fast) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard)",
  border: "1px solid transparent", boxSizing: "border-box", textDecoration: "none"
};

const variants = {
  primary: { background: "var(--btn-primary-bg)", color: "var(--btn-primary-fg)" },
  secondary: { background: "transparent", color: "var(--btn-secondary-fg)", borderColor: "var(--btn-secondary-border)" },
  quiet: { background: "transparent", color: "var(--text-link)", padding: "0", minHeight: "auto", fontSize: "var(--fs-small)", fontWeight: "var(--fw-medium)", textDecoration: "underline", textUnderlineOffset: "3px" }
};

const sizes = { md: {}, sm: { minHeight: "36px", fontSize: "var(--fs-small)", padding: "0 var(--space-4)" } };

/** Store-chrome button. Square (2px), full-width solid ink by default. */
export function Button({ variant = "primary", size = "md", full = false, disabled = false, plugin = false, children, style, ...rest }) {
  const css = {
    ...base, ...variants[variant], ...sizes[size],
    width: full ? "100%" : undefined,
    borderRadius: base.borderRadius,
    opacity: disabled ? 0.35 : 1,
    pointerEvents: disabled ? "none" : undefined,
    ...style
  };
  return <button type="button" disabled={disabled} style={css} {...rest}>{children}</button>;
}
