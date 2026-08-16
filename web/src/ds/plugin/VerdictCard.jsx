import React from "react";

/** Break's single answer — the hero of the whole product. Tinted by verdict tone. */
const TONES = {
  long: { bg: "var(--accent-soft)", fg: "var(--ink)" },
  short: { bg: "var(--state-warn-bg)", fg: "var(--state-warn-fg)" },
  fits: { bg: "var(--state-confirm-bg)", fg: "var(--state-confirm-fg)" },
  unsure: { bg: "var(--state-neutral-bg)", fg: "var(--state-neutral-fg)" },
};

export function VerdictCard({ headline, subline, tone, style, ...rest }) {
  const t = TONES[tone] ?? { bg: "var(--surface-verdict)", fg: "var(--text-primary)" };
  return (
    <div style={{ background: t.bg, borderRadius: "var(--radius-plugin)", padding: "var(--space-4) var(--space-4)", display: "grid", gap: "4px", ...style }} {...rest}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: "20px", fontWeight: "var(--fw-semibold)", lineHeight: 1.25, color: t.fg, textWrap: "pretty" }}>{headline}</span>
      {subline ? <span style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: "var(--fw-regular)", lineHeight: 1.35, color: t.fg, opacity: 0.85 }}>{subline}</span> : null}
    </div>
  );
}
