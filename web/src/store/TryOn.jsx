import React from "react";
import { Button, PhotoFrame, ChipRow, SubChip, Shimmer, ErrorNote, BreakMark } from "../ds";
import { Scroll, H1, Sub, FootBar } from "./Frame.jsx";

function AskRow({ title, detail, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", textAlign: "left", background: "var(--paper)", border: "var(--hairline)", borderRadius: "var(--radius-plugin)", padding: "var(--space-4) var(--space-4)", cursor: "pointer", boxShadow: "var(--shadow-plugin)" }}>
      <span style={{ display: "grid", gap: "2px" }}>
        <span style={{ font: "var(--text-body-role)", fontWeight: "var(--fw-medium)", color: "var(--text-primary)" }}>{title}</span>
        <span style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>{detail}</span>
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 auto" }}><path d="M9 5l7 7-7 7" /></svg>
    </button>
  );
}

export function TryOnAsk({ onPhoto, onAvatar }) {
  return (
    <Scroll>
      <div style={{ display: "grid", gap: "var(--space-5)" }}>
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <BreakMark fn="TRY-ON" />
          <H1>Show it on you</H1>
          <Sub>One photo, used only for your try-ons.</Sub>
        </div>
        <AskRow title="Upload a photo" detail="Full length, standing straight, plain background" onClick={onPhoto} />
        <AskRow title="Use an avatar" detail="No photo needed" onClick={onAvatar} />
        <p style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-muted)", margin: 0 }}>Photos are deleted after processing.</p>
      </div>
    </Scroll>
  );
}

const STAGE_TEXT = {
  verdict: () => "Checking the length",
  cloth_vto_shipped: () => "Rendering it as shipped",
  cloth_vto_hemmed: () => "Rendering it hemmed to yours",
  shoes_vto: shoe => `Putting your ${shoe.toLowerCase()} on`,
  done: () => "Ready",
};

const HEEL_HEIGHTS = ["Under 4 cm", "4 to 7 cm", "Over 7 cm"];

// Real render flow: POST /api/render starts the YouCam chain
// (verdict -> cloth VTO as shipped -> cloth VTO hemmed), then we poll the job.
// In mock mode the server simulates the timeline. The shoe chip re-runs the
// chain but cannot change the footwear — see the note by the chip below.
export function TryOnRender({ item, fit, shoe, shoes, onShoe, lengthLabel, verdict, hemPref, onCheckout, onRetry, source = "photo" }) {
  const [job, setJob] = React.useState({ stage: "verdict", done: false, error: null, result: null });
  const [len, setLen] = React.useState("your");
  const [heel, setHeel] = React.useState(HEEL_HEIGHTS[1]);
  const [compare, setCompare] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    let timer;
    setJob({ stage: "verdict", done: false, error: null, result: null });
    (async () => {
      try {
        const res = await fetch("/api/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ garmentId: item.id, lengthLabel, shoeId: fit.shoeId, benchmarkCm: fit.benchmarkCm, source }),
        });
        if (!res.ok) throw new Error("could not start the render");
        const { jobId } = await res.json();
        const poll = async () => {
          if (!alive) return;
          const r = await fetch(`/api/render/${jobId}`);
          const j = await r.json();
          if (!alive) return;
          setJob(j);
          if (!j.done) timer = setTimeout(poll, 700);
        };
        poll();
      } catch (err) {
        if (alive) setJob(j => ({ ...j, done: true, error: String(err.message || err) }));
      }
    })();
    return () => { alive = false; clearTimeout(timer); };
  }, [item.id, lengthLabel, fit.shoeId, fit.benchmarkCm, source]);


  const loading = !job.done;
  const failed = job.done && (job.error || !job.result);
  const r = job.result;
  const labels = { full: "Original", your: "Your length" };
  // Too-short pairs come back without a hemmed frame — a hem can only remove
  // length — so the length toggle and the comparison have nothing to switch to.
  const hemmable = Boolean(r?.hemmedImage);
  const img = r ? (len === "full" || !hemmable ? r.shippedImage : r.hemmedImage) ?? r.baseImage : null;

  // Before/after. Without the untouched photo in the strip there is nothing to
  // read the render against — the customer only ever sees themselves already
  // wearing the jeans. Too-short pairs have no hemmed frame to add.
  const frames = r ? [
    r.sourceImage && { key: "before", label: "Your photo", src: r.sourceImage, accent: false },
    { key: "shipped", label: "As shipped", src: r.shippedImage ?? r.baseImage, accent: false },
    hemmable && { key: "hemmed", label: "Hemmed", src: r.hemmedImage, accent: true },
  ].filter(Boolean) : [];
  const stageText = (STAGE_TEXT[job.stage] ?? (() => "Working"))(shoe?.name ?? "shoes");

  const hemOn = hemPref && verdict?.tone === "long" && len === "your";
  const total = item.priceUsd + (hemOn ? 12 : 0);

  return (
    <>
      <Scroll>
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          {loading ? (
            <>
              <Shimmer block />
              <span style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)", textAlign: "center" }}>{stageText}</span>
            </>
          ) : failed ? (
            <>
              <PhotoFrame ratio="4 / 5" label="No render" plugin />
              <ErrorNote title="Could not generate this try-on" action={source === "avatar" ? "Try a photo instead" : "Try another photo"} onAction={onRetry}>
                {/no_face/i.test(job.error || "") ?
                  (source === "avatar" ? "The avatar image needs a full-length view with the face visible" : "We need a full-length photo with your face visible") :
                  "Your photo may be too dark or cropped"}
              </ErrorNote>
            </>
          ) : compare && frames.length > 1 ? (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${frames.length}, 1fr)`, gap: "var(--space-2)" }}>
              {frames.map(f => (
                <div key={f.key} style={{ display: "grid", gap: "var(--space-2)" }}>
                  <PhotoFrame ratio="4 / 5" label={f.label} src={f.src} alt={f.label} plugin />
                  <span style={{ font: "var(--text-tiny-role)", color: f.accent ? "var(--accent)" : "var(--text-secondary)", textAlign: "center" }}>{f.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <PhotoFrame ratio="4 / 5" label={"Try-on · " + labels[len]} src={img} alt={labels[len]} plugin />
          )}

          {!loading && !failed ? (
            <>
              <ChipRow label="Shoes" options={shoes.map(s => ({ value: s.id, label: s.name }))} value={fit.shoeId} onChange={onShoe} />
              {/* The render keeps whatever shoes are in the customer's own photo —
                  cloth-v4 regenerates the lower body last and owns the footwear — so
                  say so, otherwise switching this chip reads as a broken control. */}
              <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-muted)" }}>
                Your own shoes stay in the photo above. This sets the hem we measure to.
              </span>

              {/* No shoe-preview frame here on purpose. POST /api/shoe-preview works and
                  calls YouCam's shoes task, but that task restages the whole photo — it
                  came back with cargo pants, a skirt, and denim shorts across five tries,
                  never the garment being sold. Measured 2026-08-17; see ATTRIBUTION.md. */}
              {fit.shoeId === "heels" ? (
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  {HEEL_HEIGHTS.map(h => <SubChip key={h} label={h} selected={heel === h} onClick={() => setHeel(h)} />)}
                </div>
              ) : null}
              {hemmable ? (
                <ChipRow label="Length" options={[{ value: "full", label: labels.full }, { value: "your", label: labels.your, recommended: true }]} value={len} onChange={setLen} />
              ) : (
                <span style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>
                  {verdict?.headline}. A hem only takes length off, so this one can't be fixed — try a longer size.
                </span>
              )}
              {hemOn && verdict ? (
                <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>
                  {Math.round(verdict.targetCm)} cm, hemmed for your {shoe?.name.toLowerCase()} · +$12
                </span>
              ) : null}
              {frames.length > 1 ? (
                <button type="button" onClick={() => setCompare(!compare)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-small-role)", color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "3px", justifySelf: "start" }}>
                  {compare ? "Show single view" : "Compare with your photo"}
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      </Scroll>
      <FootBar>
        <Button full disabled={loading || failed} onClick={onCheckout}>Add to bag · ${total}</Button>
      </FootBar>
    </>
  );
}
