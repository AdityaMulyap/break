import React from "react";
import { SummaryRow, Button, BreakMark, PhotoFrame, HemOption } from "../ds";
import { Scroll, H1, Sub, FootBar } from "./Frame.jsx";

const HEM_USD = 12;
const TAX_RATE = 0.07;

// Bag per the prototype: qty stepper, hem line item with Break attribution
// and a remove link, promo code, tax, Apple Pay / PayPal.
// Two confidence states survive underneath: when the verdict is unsure
// (stretch fabric), the hem sells as a prepaid credit instead —
// the irreversible step is only sold once the reversible ones are resolved.
export function Checkout({ bag, verdict, shoe, hemPref, onHemPref, order, itemShortName, onPlace, onRestart }) {
  const offerHem = verdict?.tone === "long";
  const confident = verdict?.tone === "long" || verdict?.tone === "fits";
  const [demoLow, setDemoLow] = React.useState(false);
  const [qty, setQty] = React.useState(1);
  const low = demoLow || !confident;

  const hemOn = !low && offerHem && hemPref;
  const subtotal = bag.item.priceUsd * qty + (hemOn ? HEM_USD : 0);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  const money = n => "$" + n.toFixed(2);

  return (
    <>
      <Scroll>
        <div style={{ display: "grid", gap: "var(--space-6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <H1>Your bag</H1>
            <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{qty} item{qty > 1 ? "s" : ""}</span>
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <PhotoFrame ratio="3 / 4" label="" src={bag.item.image} alt={bag.item.name} style={{ width: 72, flex: "0 0 auto" }} />
            <div style={{ display: "grid", gap: "4px", alignContent: "start", flex: 1 }}>
              <span style={{ font: "var(--text-small-role)" }}>{bag.item.name.split(" in ")[0]}</span>
              <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{bag.waist} × {bag.len} · {bag.item.wash}</span>
              <span style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)" }}>
                {money(bag.item.priceUsd)}
                {bag.item.compareAtUsd ? <span style={{ marginLeft: 6, color: "var(--text-muted)", textDecoration: "line-through" }}>{money(bag.item.compareAtUsd)}</span> : null}
              </span>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)", border: "var(--hairline)", borderRadius: "var(--radius-pill)", padding: "4px 10px", justifySelf: "start", marginTop: 4 }}>
                <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} style={{ background: "none", border: "none", cursor: "pointer", font: "var(--text-body-role)", padding: "4px 6px" }}>−</button>
                <span style={{ font: "var(--text-small-role)" }}>{qty}</span>
                <button type="button" aria-label="Increase quantity" onClick={() => setQty(qty + 1)} style={{ background: "none", border: "none", cursor: "pointer", font: "var(--text-body-role)", padding: "4px 6px" }}>+</button>
              </div>
            </div>
          </div>

          {low ? (
            <div style={{ display: "grid", gap: "var(--space-2)" }}>
              <HemOption selected title="Ships unhemmed with a hem credit" detail={`$${HEM_USD} hemming prepaid. Try it first, we hem it after`} price="Included" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <BreakMark fn="HEMMING" />
                <button type="button" onClick={() => setDemoLow(!demoLow)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-tiny-role)", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "3px" }}>demo: show high-confidence state</button>
              </div>
            </div>
          ) : hemOn && verdict ? (
            <div style={{ background: "var(--section)", borderRadius: "var(--radius-plugin)", padding: "var(--space-4)", display: "grid", gap: "var(--space-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)" }}>
                <span style={{ font: "var(--text-small-role)" }}>Hem to your length, {Math.round(verdict.targetCm)} cm</span>
                <span style={{ font: "var(--text-small-role)" }}>+{money(HEM_USD)}</span>
              </div>
              <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>Sits right in your {shoe?.name.toLowerCase() ?? "shoes"} · adds 3 days</span>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <BreakMark fn="HEMMING" />
                <button type="button" onClick={() => onHemPref(false)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-tiny-role)", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "3px" }}>Remove hemming</button>
              </div>
            </div>
          ) : offerHem ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>Ships at original length ({bag.garmentCm} cm)</span>
              <button type="button" onClick={() => onHemPref(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-small-role)", color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "3px" }}>Add hemming +${HEM_USD}</button>
            </div>
          ) : (
            <Sub>Already your length in your {shoe?.name.toLowerCase() ?? "shoes"}. No changes needed.</Sub>
          )}

          <button type="button" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-small-role)", color: "var(--text-link)", justifySelf: "start", textDecoration: "underline", textUnderlineOffset: "3px" }}>+ Add promo code</button>

          <div style={{ display: "grid", gap: "var(--space-3)", borderTop: "var(--hairline)", paddingTop: "var(--space-4)" }}>
            <SummaryRow label="Subtotal" value={money(subtotal)} />
            <SummaryRow label="Shipping" value="Free" />
            <SummaryRow label="Estimated tax" value={money(tax)} />
            <SummaryRow label="Total" value={money(total)} total />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
            <button type="button" style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-semibold)", background: "var(--ink)", color: "var(--paper)", border: "none", borderRadius: "var(--radius-pill)", padding: "13px 0", cursor: "pointer" }}> Pay</button>
            <button type="button" style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-semibold)", background: "var(--paper)", color: "var(--ink)", border: "1px solid var(--ink)", borderRadius: "var(--radius-pill)", padding: "13px 0", cursor: "pointer" }}>PayPal</button>
          </div>

          {!low && confident ? (
            <button type="button" onClick={() => setDemoLow(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-tiny-role)", color: "var(--text-muted)", textDecoration: "underline", textUnderlineOffset: "3px", justifySelf: "start" }}>demo: show lower-confidence state</button>
          ) : null}
        </div>
      </Scroll>
      <FootBar>
        <Button full disabled={Boolean(order)} onClick={() => onPlace({ hemmed: hemOn, low, total })}>Checkout</Button>
      </FootBar>

      {order ? (
        <div className="confirm-banner" style={{ position: "absolute", left: 8, right: 8, bottom: 8, zIndex: 30 }}>
          <div style={{ background: "var(--accent)", borderRadius: "var(--radius-plugin)", padding: "var(--space-5)", display: "grid", gap: "var(--space-2)", boxShadow: "var(--shadow-sheet)" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-brandmark)", textTransform: "uppercase", color: "rgba(255,255,255,.75)" }}>Powered by Break</span>
            <span style={{ font: "var(--text-h1)", color: "#fff", textWrap: "balance" }}>{order.hemmed ? `${itemShortName}, hemmed right for you` : "Order confirmed"}</span>
            <span style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "rgba(255,255,255,.85)" }}>
              {order.low
                ? "Order placed. Ships unhemmed with your hem credit — try it first, we hem it after."
                : order.hemmed
                  ? "Order placed. Arrives hemmed in 5 to 8 days."
                  : "Order placed. Arrives in 4 to 6 days."}
            </span>
            <button type="button" onClick={onRestart} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-small-role)", color: "#fff", textDecoration: "underline", textUnderlineOffset: "3px", justifySelf: "start" }}>Back to the store</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
