import React from "react";

/** Placeholder frame standing in for product photography or a try-on render. */
export function PhotoFrame({ ratio = "3 / 4", label = "PRODUCT PHOTO", tone = "var(--section)", src, alt = "", plugin = false, style, ...rest }) {
  return (
    <div style={{ aspectRatio: ratio, background: tone, borderRadius: plugin ? "var(--radius-plugin)" : "var(--radius-store)", overflow: "hidden", position: "relative", display: "grid", placeItems: "center", ...style }} {...rest}>
      {src
        ? <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        : <>
            <div style={{ position: "absolute", inset: 0, border: "var(--hairline)", borderRadius: "inherit", pointerEvents: "none" }} />
            <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-muted)" }}>{label}</span>
          </>}
    </div>
  );
}
