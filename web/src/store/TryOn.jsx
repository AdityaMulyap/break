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
  shoes_vto: shoe => `Putting your ${shoe.toLowerCase()} on first`,
  verdict: () => "Checking the length",
  cloth_vto_shipped: () => "Rendering it as shipped",
  cloth_vto_hemmed: () => "Rendering it hemmed to yours",
  done: () => "Ready",
};

const HEEL_HEIGHTS = ["Under 4 cm", "4 to 7 cm", "Over 7 cm"];

// Real render flow: POST /api/render starts the YouCam chain
// (shoes VTO -> verdict -> cloth VTO as shipped -> cloth VTO hemmed),
// then we poll the job. Changing the shoe chip re-runs the chain — the
// on-camera API moment. In mock mode the server simulates the timeline.
export function TryOnRender({ item, fit, shoe, shoes, onShoe, lengthLabel, verdict, hemPref, onCheckout, onRetry }) {
  const [job, setJob] = React.useState({ stage: "shoes_vto", done: false, error: null, result: null });
  const [len, setLen] = React.useState("your");
  const [heel, setHeel] = React.useState(HEEL_HEIGHTS[1]);
  const [compare, setCompare] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    let timer;
    setJob({ stage: "shoes_vto", done: false, error: null, result: null });
    (async () => {
      try {
        const res = await fetch("/api/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ garmentId: item.id, lengthLabel, shoeId: fit.shoeId, benchmarkCm: fit.benchmarkCm }),
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
  }, [item.id, lengthLabel, fit.shoeId, fit.benchmarkCm]);

  const loading = !job.done;
  const failed = job.done && (job.error || !job.result);
  const r = job.result;
  const labels = { full: "Original", your: "Your length" };
  const img = r ? (len === "full" ? r.shippedImage : r.hemmedImage) ?? r.baseImage : null;
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
              <ErrorNote title="Could not generate this try-on" action="Try another photo" onAction={onRetry}>Your photo may be too dark or cropped</ErrorNote>
            </>
          ) : compare ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
              <div style={{ display: "grid", gap: "var(--space-2)" }}>
                <PhotoFrame ratio="4 / 5" label="As shipped" src={r.shippedImage} alt="As shipped" plugin />
                <span style={{ font: "var(--text-tiny-role)", color: "var(--text-secondary)", textAlign: "center" }}>As shipped</span>
              </div>
              <div style={{ display: "grid", gap: "var(--space-2)" }}>
                <PhotoFrame ratio="4 / 5" label="Hemmed" src={r.hemmedImage} alt="Hemmed to your length" plugin />
                <span style={{ font: "var(--text-tiny-role)", color: "var(--accent)", textAlign: "center" }}>Hemmed</span>
              </div>
            </div>
          ) : (
            <PhotoFrame ratio="4 / 5" label={"Try-on · " + labels[len]} src={img} alt={labels[len]} plugin />
          )}

          {!loading && !failed ? (
            <>
              <ChipRow label="Shoes" options={shoes.map(s => ({ value: s.id, label: s.name }))} value={fit.shoeId} onChange={onShoe} />
              {fit.shoeId === "heels" ? (
                <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                  {HEEL_HEIGHTS.map(h => <SubChip key={h} label={h} selected={heel === h} onClick={() => setHeel(h)} />)}
                </div>
              ) : null}
              <ChipRow label="Length" options={[{ value: "full", label: labels.full }, { value: "your", label: labels.your, recommended: true }]} value={len} onChange={setLen} />
              {hemOn && verdict ? (
                <span style={{ font: "var(--text-tiny-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)" }}>
                  {Math.round(verdict.targetCm)} cm, hemmed for your {shoe?.name.toLowerCase()} · +$12
                </span>
              ) : null}
              <button type="button" onClick={() => setCompare(!compare)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-small-role)", color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "3px", justifySelf: "start" }}>
                {compare ? "Show single view" : "As shipped vs. hemmed"}
              </button>
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
