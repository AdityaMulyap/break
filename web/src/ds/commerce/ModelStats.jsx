import React from "react";

/** Tiny model-stats line under the PDP hero. */
export function ModelStats({ children = "Model is 5'7\", wearing 26 \u00D7 30", style, ...rest }) {
  return <p style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)", margin: 0, ...style }} {...rest}>{children}</p>;
}
