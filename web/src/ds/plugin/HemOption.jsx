import React from "react";

/** Checkout / length option row. Selection is a 1px ink border plus a RECOMMENDED pill on the top edge. */
export function HemOption({ title, detail, price, selected = false, recommended = false, onClick, style, ...rest }) {
  const row = (
    <button type="button" onClick={onClick} aria-pressed={selected} style={{
      width: "100%", textAlign: "left", cursor: "pointer", display: "flex", gap: "var(--space-4)", alignItems: "flex-start",
      background: "var(--paper)", border: selected ? "1px solid var(--ink)" : "var(--hairline)",
      borderRadius: "var(--radius-plugin)", padding: "12px 14px", boxSizing: "border-box",
      transition: "border-color var(--dur-fast) var(--ease-standard)", ...(recommended && selected ? {} : style)
    }} {...(recommended && selected ? {} : rest)}>
      <span style={{ display: "grid", gap: "2px", flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: "var(--fw-semibold)", lineHeight: 1.3, color: "var(--text-primary)" }}>{title}</span>
        {detail ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: "var(--fw-regular)", lineHeight: 1.35, color: "var(--text-muted)" }}>{detail}</span> : null}
      </span>
      {price ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", fontWeight: "var(--fw-medium)", color: "var(--text-primary)", whiteSpace: "nowrap", flex: "0 0 auto" }}>{price}</span> : null}
    </button>
  );
  if (!(recommended && selected)) return row;
  return (
    <div style={{ position: "relative", paddingTop: "6px", ...style }} {...rest}>
      <span style={{ position: "absolute", top: 0, left: "12px", background: "var(--ink)", color: "var(--paper)", fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: "var(--fw-semibold)", letterSpacing: ".1em", lineHeight: 1.4, padding: "2px 7px", borderRadius: "var(--radius-pill)" }}>RECOMMENDED</span>
      {row}
    </div>
  );
}
