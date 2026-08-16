import React from "react";
import { PhotoFrame, SelectorRow, SizeBox, WashSwatch, ModelStats, StickyBar, PluginRow } from "../ds";
import { Scroll, H1 } from "./Frame.jsx";

export function Pdp({ item, verdict, answered, onOpenVerdict, onAdd, waist, onWaist, len, onLen }) {
  const [wash, setWash] = React.useState(0);
  const [saved, setSaved] = React.useState(false);

  return (
    <>
      <Scroll pad={false}>
        <PhotoFrame ratio="4 / 5" label={item.name.toUpperCase() + " · " + item.wash.toUpperCase()} style={{ borderRadius: 0 }} />
        <div style={{ padding: "var(--space-5) var(--page-margin) var(--space-8)", display: "grid", gap: "var(--space-5)" }}>
          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            <H1>{item.name}</H1>
            <span style={{ font: "var(--text-body-role)", color: "var(--text-secondary)" }}>{item.wash}</span>
            <span style={{ font: "var(--text-body-role)", color: "var(--text-primary)" }}>${item.priceUsd}</span>
            <ModelStats>Model is 5'9", wearing 28 × {item.lengths[0].label}</ModelStats>
          </div>

          <div style={{ display: "grid", gap: "var(--space-2)" }}>
            <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>{item.stretch}</span>
            <div style={{ display: "flex", gap: "var(--grid-gap)" }}>
              {item.washes.map((w, i) => <WashSwatch key={w.name} color={w.color} name={w.name} selected={i === wash} onClick={() => setWash(i)} />)}
            </div>
          </div>

          <SelectorRow label="Waist" value={waist} action="Size guide">
            {item.waists.map(s => <SizeBox key={s} label={s} selected={waist === s} outOfStock={s === "34"} onClick={() => onWaist(s)} />)}
          </SelectorRow>

          <SelectorRow label="Length" value={len}>
            {item.lengths.map(l => <SizeBox key={l.label} label={l.label} selected={len === l.label} onClick={() => onLen(l.label)} />)}
          </SelectorRow>

          <PluginRow answered={answered ? verdict?.headline : undefined} tone={verdict?.tone === "unsure" ? "neutral" : verdict?.tone === "short" ? "long" : verdict?.tone} onClick={onOpenVerdict} />

          <div style={{ display: "grid", gap: "var(--space-3)", borderTop: "var(--hairline)", paddingTop: "var(--space-4)" }}>
            <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>Details</span>
            <p style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)", margin: 0, textWrap: "pretty" }}>{item.details}</p>
          </div>
        </div>
      </Scroll>
      <StickyBar saved={saved} onSave={() => setSaved(!saved)} onAction={onAdd} />
    </>
  );
}
