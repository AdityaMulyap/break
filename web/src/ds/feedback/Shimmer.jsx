import React from "react";

/** Loading placeholder. `block` fills a 4:5 photo slot; otherwise a text-height bar. */
export function Shimmer({ height = "16px", width = "100%", radius = "var(--radius-store)", block = false, style, ...rest }) {
  const bar = {
    height: block ? "auto" : height, width, borderRadius: block ? "var(--radius-plugin)" : radius,
    aspectRatio: block ? "4 / 5" : undefined,
    background: "linear-gradient(90deg,var(--shimmer-base) 0%,var(--shimmer-sheen) 50%,var(--shimmer-base) 100%)",
    backgroundSize: "200% 100%", animation: "breakShimmer var(--dur-shimmer) linear infinite", ...style
  };
  return <><div style={bar} {...rest} /><style>{"@keyframes breakShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}"}</style></>;
}
