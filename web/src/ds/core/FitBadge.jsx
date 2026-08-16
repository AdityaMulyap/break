import React from "react";

/** Small verdict badge shown on catalog photos when "Sort by my fit" is on. */
export function FitBadge({ children, style, ...rest }) {
  return (
    <span style={{ background: "var(--paper)", border: "var(--hairline)", borderRadius: "var(--radius-store)", color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", lineHeight: 1.4, padding: "3px 7px", whiteSpace: "nowrap", display: "inline-block", ...style }} {...rest}>
      {children}
    </span>
  );
}
