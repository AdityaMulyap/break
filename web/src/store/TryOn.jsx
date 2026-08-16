import React from "react";
import { Button, PhotoFrame, ChipRow, Shimmer, ErrorNote, BreakMark } from "../ds";
import { Scroll, H1, Sub, FootBar } from "./Frame.jsx";

export function TryOnAsk({ onPhoto, onAvatar }) {
  return (
    <Scroll>
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        <div style={{ display: "grid", gap: "var(--space-2)" }}>
          <BreakMark fn="TRY-ON" />
          <H1>Show it on you</H1>
          <Sub>One photo, used once for this render.</Sub>
        </div>
        <PhotoFrame ratio="4 / 5" label="Your photo goes here" plugin />
        <p style={{ font: "var(--text-small-role)", fontWeight: "var(--fw-regular)", color: "var(--text-secondary)", margin: 0, textWrap: "pretty" }}>Full length, ankles and shoes in frame. Plain light works best.</p>
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <Button full plugin onClick={onPhoto}>Upload a photo</Button>
          <Button variant="secondary" full plugin onClick={onAvatar}>Use an avatar instead</Button>
        </div>
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

// Real render flow: POST /api/render starts the YouCam chain
// (shoes VTO -> verdict -> cloth VTO as shipped -> cloth VTO hemmed),
// then we poll the job. In mock mode the server simulates the timeline.
export function TryOnRender({ item, fit, shoe, lengthLabel, onCheckout, onRetry }) {
  const [job, setJob] = React.useState({ stage: "shoes_vto", done: false, error: null, result: null });
  const [len, setLen] = React.useState("your");
  const [compare, setCompare] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    let timer;
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
  const labels = { full: "Full length", your: "Your length" };
  const img = r ? (len === "full" ? r.shippedImage : r.hemmedImage) ?? r.baseImage : null;
  const stageText = (STAGE_TEXT[job.stage] ?? (() => "Working"))(shoe?.name ?? "shoes");

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
              <ChipRow options={[{ value: "full", label: labels.full }, { value: "your", label: labels.your, recommended: true }]} value={len} onChange={setLen} />
              <button type="button" onClick={() => setCompare(!compare)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-small-role)", color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "3px", justifySelf: "start" }}>
                {compare ? "Show single view" : "As shipped vs. hemmed"}
              </button>
            </>
          ) : null}
        </div>
      </Scroll>
      <FootBar>
        <Button full disabled={loading || failed} onClick={onCheckout}>Add To Bag</Button>
      </FootBar>
    </>
  );
}
