import React from "react";
import { BottomSheet, BreakMark, VerdictCard, MeasureReceipt, ChipRow, Button, Shimmer, HemOption } from "../ds";
import { FitSetup, FitConfirm } from "./FitSetup.jsx";
import { fitVerdict } from "../../../lib/fit.js";

// The Length Check sheet. First open ever: Break introduces itself and asks
// for the benchmark pair right here, then answers. Every later open goes
// straight to the verdict.
export function BreakSheet({ open, item, lengthLabel, fit, shoes, benchmarks, onFit, hemPref, onHemPref, onClose, onSeeIt }) {
  const [unit, setUnit] = React.useState("cm");
  const [busy, setBusy] = React.useState(false);
  const [view, setView] = React.useState(fit ? "verdict" : "setup");
  const [pendingFit, setPendingFit] = React.useState(null);

  React.useEffect(() => { if (open) setView(fit ? "verdict" : "setup"); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const shoe = shoes.find(s => s.id === (fit?.shoeId ?? "sneakers"));
  const length = item.lengths.find(l => l.label === lengthLabel) ?? item.lengths[0];
  const v = fit ? fitVerdict({ benchmarkCm: fit.benchmarkCm, garmentCm: length.inseamCm, shoe, stretch: item.stretch }) : null;
  const num = cm => unit === "cm" ? String(Math.round(cm * 10) / 10) : (cm / 2.54).toFixed(1);

  function changeShoe(nextId) {
    setBusy(true);
    onFit({ ...fit, shoeId: nextId });
    setTimeout(() => setBusy(false), 420);
  }

  const shortName = item.name.split(" ").slice(0, 2).join(" "); // "The Mara"

  return (
    <BottomSheet open={open} onClose={onClose} title={<BreakMark fn="LENGTH CHECK" />}
      footer={view === "verdict" && v
        ? <Button full plugin onClick={onSeeIt}>See it on you</Button>
        : undefined}>
      {view === "setup" ? (
        <FitSetup compact benchmarks={benchmarks} shoes={shoes}
          onDone={f => { setPendingFit(f); setView("confirm"); }} />
      ) : view === "confirm" ? (
        <FitConfirm compact fit={pendingFit} itemName={shortName}
          onContinue={() => { onFit(pendingFit); setView("verdict"); }} />
      ) : (
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ font: "var(--text-small-role)", color: "var(--text-secondary)" }}>{shortName} · {item.waists.includes("28") ? "28" : item.waists[0]} × {length.label}</span>
            <div style={{ display: "inline-flex", border: "var(--hairline)", borderRadius: "var(--radius-plugin)", overflow: "hidden" }}>
              {["cm", "in"].map(u => (
                <button key={u} type="button" onClick={() => setUnit(u)} aria-pressed={unit === u} style={{ font: "var(--text-small-role)", padding: "12px 16px", cursor: "pointer", border: "none", background: unit === u ? "var(--ink)" : "var(--paper)", color: unit === u ? "var(--paper)" : "var(--text-secondary)" }}>{u}</button>
              ))}
            </div>
          </div>

          {busy
            ? <Shimmer height="92px" radius="var(--radius-plugin)" />
            : <VerdictCard headline={v.headline} subline={v.subline} tone={v.tone} />}

          <MeasureReceipt heading="Length" unit={unit}
            rows={[{ label: "This garment", value: num(length.inseamCm) }, { label: "Your length", value: num(v.targetCm) }]}
            note={v.tone === "unsure" ? "Waist and hip look right, but this fabric moves" : "Waist and hip look right for this size"} />

          <ChipRow label="Usually worn with" options={shoes.map(s => ({ value: s.id, label: s.name }))} value={fit.shoeId} onChange={changeShoe} />

          {v.tone === "long" ? (
            <div style={{ display: "grid", gap: "var(--space-3)" }}>
              <HemOption selected={!hemPref} onClick={() => onHemPref(false)} title="Original"
                detail={`${Math.round(length.inseamCm)} cm, pools on the floor in your ${shoe.name.toLowerCase()}`} price="Included" />
              <HemOption selected={hemPref} recommended={hemPref} onClick={() => onHemPref(true)} title="Hem to your length"
                detail={`${Math.round(v.targetCm)} cm, adds 3 days`} price="+$12" />
            </div>
          ) : v.tone === "fits" ? (
            <HemOption selected title="Original" detail={`Already your length in your ${shoe.name.toLowerCase()}`} price="Included" />
          ) : null}
        </div>
      )}
    </BottomSheet>
  );
}
