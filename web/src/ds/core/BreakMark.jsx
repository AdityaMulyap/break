import React from "react";

/** The plugin's mark: BREAK in indigo, always paired with its function. */
export function BreakMark({ fn = "LENGTH CHECK", separator = "\u00B7", color = "var(--accent)", style, ...rest }) {
  return (
    <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--fs-tiny)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-brandmark)", textTransform: "uppercase", color, whiteSpace: "nowrap", ...style }} {...rest}>
      Break{fn ? ` ${separator} ${fn}` : ""}
    </span>
  );
}
