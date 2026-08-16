import React, { useEffect, useState } from "react";
import { Shell, StoreHeader } from "./store/Frame.jsx";
import { Home } from "./store/Home.jsx";
import { Catalog } from "./store/Catalog.jsx";
import { Pdp } from "./store/Pdp.jsx";
import { BreakSheet } from "./store/BreakSheet.jsx";
import { FitSetup, FitConfirm } from "./store/FitSetup.jsx";
import { TryOnAsk, TryOnRender } from "./store/TryOn.jsx";
import { Checkout, Confirmed } from "./store/Checkout.jsx";
import { BreakMark } from "./ds";
import { fitVerdict } from "../../lib/fit.js";

const FIT_KEY = "break.fit";

const readFit = () => {
  try { return JSON.parse(localStorage.getItem(FIT_KEY)) ?? null; } catch { return null; }
};

export default function App() {
  const [data, setData] = useState(null); // { catalog, shoes, benchmarks }
  const [screen, setScreen] = useState("home");
  const [fit, setFitState] = useState(readFit);
  const [item, setItem] = useState(null);
  const [waist, setWaist] = useState("28");
  const [len, setLen] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [bag, setBag] = useState(null);
  const [order, setOrder] = useState(null);
  const [seenPhotoAsk, setSeenPhotoAsk] = useState(false);
  const [setupFit, setSetupFit] = useState(null); // pending fit on the full-screen setup path

  useEffect(() => {
    Promise.all([
      fetch("/api/catalog").then(r => r.json()),
      fetch("/api/shoes").then(r => r.json()),
      fetch("/api/benchmarks").then(r => r.json()),
    ]).then(([catalog, shoes, benchmarks]) => setData({ catalog, shoes, benchmarks }));
  }, []);

  const setFit = f => {
    setFitState(f);
    if (f) localStorage.setItem(FIT_KEY, JSON.stringify(f));
    else localStorage.removeItem(FIT_KEY);
  };

  if (!data) return <Shell><StoreHeader /><div /></Shell>;

  const shoe = data.shoes.find(s => s.id === (fit?.shoeId ?? "sneakers"));
  const length = item?.lengths.find(l => l.label === len) ?? item?.lengths[0];
  const verdict = fit && item
    ? fitVerdict({ benchmarkCm: fit.benchmarkCm, garmentCm: length.inseamCm, shoe, stretch: item.stretch })
    : null;
  const shortName = item ? item.name.split(" ").slice(0, 2).join(" ") : "";

  const openItem = i => {
    setItem(i);
    setLen(i.lengths[0].label);
    setWaist(i.waists.includes("28") ? "28" : i.waists[0]);
    setAnswered(false);
    setScreen("pdp");
  };

  const back = {
    catalog: "home", pdp: "catalog", fitsetup: "catalog", fitconfirm: null,
    ask: "pdp", render: seenPhotoAsk ? "ask" : "pdp", checkout: "pdp", done: null, home: null,
  };

  return (
    <Shell>
      <StoreHeader
        onBack={back[screen] ? () => setScreen(back[screen]) : undefined}
        title={screen === "fitsetup" || screen === "fitconfirm" ? <BreakMark fn="MY FIT" /> : undefined}
      />

      {screen === "home" && <Home catalog={data.catalog} onShop={() => setScreen("catalog")} onOpen={openItem} />}

      {screen === "catalog" && (
        <Catalog catalog={data.catalog} fit={fit} shoe={shoe} onOpen={openItem}
          onSetFit={() => setScreen("fitsetup")} onEditFit={() => setScreen("fitsetup")} />
      )}

      {screen === "fitsetup" && (
        <div style={{ overflowY: "auto", padding: "var(--space-6) var(--page-margin) var(--space-8)" }}>
          <FitSetup benchmarks={data.benchmarks} shoes={data.shoes} initialShoe={fit?.shoeId ?? "sneakers"}
            onDone={f => { setSetupFit(f); setScreen("fitconfirm"); }} />
        </div>
      )}

      {screen === "fitconfirm" && setupFit && (
        <div style={{ overflowY: "auto", padding: "var(--space-6) var(--page-margin) var(--space-8)" }}>
          <FitConfirm fit={setupFit} onContinue={() => { setFit(setupFit); setScreen("catalog"); }} />
        </div>
      )}

      {screen === "pdp" && item && (
        <Pdp item={item} verdict={verdict} answered={answered}
          waist={waist} onWaist={setWaist} len={len} onLen={setLen}
          onOpenVerdict={() => { setSheet(true); if (fit) setAnswered(true); }}
          onAdd={() => { setBag({ item, waist, len, garmentCm: length.inseamCm }); setScreen("checkout"); }} />
      )}

      {screen === "ask" && <TryOnAsk onPhoto={() => { setSeenPhotoAsk(true); setScreen("render"); }} onAvatar={() => { setSeenPhotoAsk(true); setScreen("render"); }} />}

      {screen === "render" && item && fit && (
        <TryOnRender item={item} fit={fit} shoe={shoe} lengthLabel={length.label}
          onRetry={() => setScreen("ask")}
          onCheckout={() => { setBag({ item, waist, len: length.label, garmentCm: length.inseamCm }); setScreen("checkout"); }} />
      )}

      {screen === "checkout" && bag && <Checkout bag={bag} verdict={verdict} onPlace={o => { setOrder(o); setScreen("done"); }} />}

      {screen === "done" && <Confirmed order={order} itemShortName={shortName} onRestart={() => setScreen("home")} />}

      {screen === "pdp" && item && (
        <BreakSheet open={sheet} item={item} lengthLabel={length?.label} fit={fit}
          shoes={data.shoes} benchmarks={data.benchmarks}
          onFit={f => { setFit(f); setAnswered(true); }}
          onClose={() => setSheet(false)}
          onSeeIt={() => { setSheet(false); setScreen(seenPhotoAsk ? "render" : "ask"); }} />
      )}
    </Shell>
  );
}
