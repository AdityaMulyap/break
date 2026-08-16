import React from "react";
import { HemOption, SummaryRow, Button, BreakMark, PhotoFrame } from "../ds";
import { Scroll, H1, Sub, FootBar } from "./Frame.jsx";

const HEM_USD = 12;

// Two confidence states, per the risk design:
// - Confident (verdict "too long", waist/hip in tolerance): hem before
//   shipping is offered as the recommended paid option.
// - Not confident (stretch fabric / no verdict): the garment ships
//   unhemmed with a prepaid hem credit. Try it first, we hem it after.
// The irreversible step is only sold once the reversible ones are resolved.
export function Checkout({ bag, verdict, onPlace }) {
  const offerHem = verdict?.tone === "long";
  const confident = verdict?.tone === "long" || verdict?.tone === "fits";
  const [demoLow, setDemoLow] = React.useState(false);
  const low = demoLow || !confident;

  const [hem, setHem] = React.useState(true);
  const base = bag.item.priceUsd;
  const hemOn = !low && offerHem && hem;
  const total = base + (hemOn ? HEM_USD : 0);

  return (
    <>
      <Scroll>
        <div style={{ display: "grid", gap: "var(--space-6)" }}>
          <H1>Your bag</H1>

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <PhotoFrame ratio="3 / 4" label="" style={{ width: 72, flex: "0 0 auto" }} />
            <div style={{ display: "grid", gap: "2px", alignContent: "start" }}>
              <span style={{ font: "var(--text-small-role)" }}>{bag.item.name}</span>
              <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{bag.item.wash} · {bag.waist} × {bag.len}</span>
              <span style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)" }}>${base}</span>
            </div>
          </div>

          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>Length</span>
            {low ? (
              <HemOption selected title="Ships unhemmed with a hem credit" detail="Try it first, we hem it after" price="Included" />
            ) : offerHem ? (
              <>
                <HemOption selected={!hem} title="Original" detail={`${bag.garmentCm} cm as shipped`} price="Included" onClick={() => setHem(false)} />
                <HemOption selected={hem} recommended={hem} onClick={() => setHem(true)} title="Hem to your length before shipping" detail={`${Math.round(verdict.targetCm)} cm, + 3 days`} price={`+$${HEM_USD}`} />
              </>
            ) : (
              <HemOption selected title="Original" detail="Already your length in these shoes" price="Included" />
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <BreakMark fn="HEMMING" />
              <button type="button" onClick={() => setDemoLow(!demoLow)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-tiny-role)", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "3px", whiteSpace: "nowrap" }}>
                demo: show {low ? "high" : "lower"}-confidence state
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: "var(--space-3)", borderTop: "var(--hairline)", paddingTop: "var(--space-4)" }}>
            <SummaryRow label="Subtotal" value={"$" + base} />
            {hemOn ? <SummaryRow label="Hem to your length" note="+ 3 days" value={`+$${HEM_USD}`} /> : null}
            {low ? <SummaryRow label="Hem credit" note="redeem after it arrives" value="Included" /> : null}
            <SummaryRow label="Shipping" value="Free" />
            <SummaryRow label="Total" value={"$" + total} total />
          </div>
        </div>
      </Scroll>
      <FootBar>
        <Button full onClick={() => onPlace({ hemmed: hemOn, low })}>Place order</Button>
      </FootBar>
    </>
  );
}

export function Confirmed({ order, itemShortName, onRestart }) {
  const headline = order?.hemmed ? `${itemShortName}, hemmed right for you` : "Order confirmed";
  const sub = order?.low
    ? "Shipping unhemmed with your hem credit. Try it first, we hem it after."
    : order?.hemmed
      ? "We'll hem to your length before it ships. Arriving in 6 to 8 days."
      : "Arriving in 4 to 6 days.";
  return (
    <Scroll>
      <div style={{ display: "grid", gap: "var(--space-5)", paddingTop: "var(--space-10)", justifyItems: "center", textAlign: "center" }}>
        <H1>{headline}</H1>
        <Sub>{sub}</Sub>
        <Button variant="quiet" onClick={onRestart}>Back to the store</Button>
      </div>
    </Scroll>
  );
}
