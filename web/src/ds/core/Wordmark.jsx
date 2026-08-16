import React from "react";

/** The fictional store's wordmark: RIVET DENIM CO., 13/600, 0.18em, all caps. */
export function Wordmark({ text = "RIVET DENIM CO.", color = "var(--ink)", size = "var(--fs-small)", style, ...rest }) {
  return (
    <span style={{ fontFamily: "var(--font-sans)", fontSize: size, fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-wordmark)", textTransform: "uppercase", color, whiteSpace: "nowrap", ...style }} {...rest}>
      {text}
    </span>
  );
}
