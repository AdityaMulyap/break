import React from "react";
import { Chip } from "../forms/Chip.jsx";

/** Labelled row of chips — shoes on the verdict sheet, hem length on the render screen. */
export function ChipRow({ label, help, options = [], value, onChange, style, ...rest }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-2)", ...style }} {...rest}>
      {label ? <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>{label}</span> : null}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        {options.map(o => {
          const key = typeof o === "string" ? o : o.value;
          const text = typeof o === "string" ? o : o.label;
          return <Chip key={key} label={text} selected={value === key} recommended={typeof o !== "string" && o.recommended} onClick={() => onChange && onChange(key)} />;
        })}
      </div>
      {help ? <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{help}</span> : null}
    </div>
  );
}
