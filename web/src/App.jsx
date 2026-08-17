import React, { useEffect, useRef, useState } from "react";
import { Shell, StoreHeader, TabBar } from "./store/Frame.jsx";
import { Home } from "./store/Home.jsx";
import { Catalog } from "./store/Catalog.jsx";
import { Pdp } from "./store/Pdp.jsx";
import { BreakSheet } from "./store/BreakSheet.jsx";
import { FitSetup, FitConfirm } from "./store/FitSetup.jsx";
import { TryOnAsk, TryOnRender } from "./store/TryOn.jsx";
import { Checkout } from "./store/Checkout.jsx";
import { BreakMark } from "./ds";
import { fitVerdict } from "../../lib/fit.js";

const FIT_KEY = "break.fit";
const SESSION_KEY = "rivet.session";

const readJson = (store, key) => {
  try { return JSON.parse(store.getItem(key)) ?? null; } catch { return null; }
};

// Hash routes so browser/hardware back walks the flow instead of exiting,
// and a refresh restores where you were (fit lives in localStorage, the
// in-progress session in sessionStorage).
const HASHES = {
  home: "#/", catalog: "#/catalog", pdp: "#/p/", fitsetup: "#/fit", fitconfirm: "#/fit/confirm",
  ask: "#/tryon", render: "#/render", checkout: "#/bag", done: "#/done",
};

function parseHash(hash) {
  if (!hash || hash === "#/" || hash === "#") return { screen: "home" };
  if (hash.startsWith("#/p/")) return { screen: "pdp", itemId: hash.slice(4) };
  const entry = Object.entries(HASHES).find(([, h]) => h === hash);
  return { screen: entry ? entry[0] : "home", itemId: null };
}

export default function App() {
  const [data, setData] = useState(null); // { catalog, shoes, benchmarks }
  const [screen, setScreen] = useState("home");
  const [fit, setFitState] = useState(() => readJson(localStorage, FIT_KEY));
  const [item, setItem] = useState(null);
  const [waist, setWaist] = useState("28");
  const [len, setLen] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [bag, setBag] = useState(null);
  const [order, setOrder] = useState(null);
  const [seenPhotoAsk, setSeenPhotoAsk] = useState(false);
  const [renderSource, setRenderSource] = useState("photo"); // "photo" | "avatar", from the try-on ask screen
  const [setupFit, setSetupFit] = useState(null);
  const [hemPref, setHemPref] = useState(true); // hem-to-length selected, from the sheet's length options

  // Everything the popstate listener needs, without re-binding.
  const live = useRef({});
  live.current = { data, fit, item, bag, order };

  useEffect(() => {
    Promise.all([
      fetch("/api/catalog").then(r => r.json()),
      fetch("/api/shoes").then(r => r.json()),
      fetch("/api/benchmarks").then(r => r.json()),
    ]).then(([catalog, shoes, benchmarks]) => setData({ catalog, shoes, benchmarks }));
  }, []);

  // Restore session once data arrives, honoring the URL over the session.
  useEffect(() => {
    if (!data) return;
    const saved = readJson(sessionStorage, SESSION_KEY) ?? {};
    const wanted = location.hash ? parseHash(location.hash) : { screen: saved.screen, itemId: saved.itemId };
    const savedItem = data.catalog.find(g => g.id === (wanted.itemId ?? saved.itemId)) ?? null;
    if (savedItem) {
      setItem(savedItem);
      setLen(saved.len && savedItem.lengths.some(l => l.label === saved.len) ? saved.len : savedItem.lengths[0].label);
      setWaist(saved.waist ?? (savedItem.waists.includes("28") ? "28" : savedItem.waists[0]));
      setAnswered(Boolean(saved.answered));
    }
    if (saved.bag) {
      const bagItem = data.catalog.find(g => g.id === saved.bag.itemId);
      if (bagItem) setBag({ ...saved.bag, item: bagItem });
    }
    if (saved.order) setOrder(saved.order);
    if (saved.seenPhotoAsk) setSeenPhotoAsk(true);
    setScreen(guard(wanted.screen ?? "home", {
      item: savedItem,
      fit: readJson(localStorage, FIT_KEY),
      bag: saved.bag ? data.catalog.find(g => g.id === saved.bag.itemId) && saved.bag : null,
      order: saved.order,
    }));
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Screens with prerequisites fall back to somewhere sensible.
  function guard(target, { item, fit, bag, order }) {
    if ((target === "pdp" || target === "ask") && !item) return "catalog";
    if (target === "render" && !(item && fit)) return item ? "pdp" : "catalog";
    if (target === "checkout" && !bag) return item ? "pdp" : "catalog";
    if (target === "done") return order ? "checkout" : "home"; // confirmation now overlays the bag
    if (target === "fitconfirm") return "fitsetup";
    return target ?? "home";
  }

  // Keep the URL in step with the screen.
  useEffect(() => {
    if (!data) return;
    const h = screen === "pdp" ? HASHES.pdp + (item?.id ?? "") : HASHES[screen];
    if (location.hash !== h) history.pushState(null, "", h);
  }, [screen, item, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Browser/hardware back.
  useEffect(() => {
    const onPop = () => {
      const { data, fit, bag, order } = live.current;
      if (!data) return;
      const wanted = parseHash(location.hash);
      if (wanted.itemId) {
        const g = data.catalog.find(x => x.id === wanted.itemId);
        if (g) { setItem(g); setLen(l => g.lengths.some(x => x.label === l) ? l : g.lengths[0].label); }
      }
      setSheet(false);
      setScreen(guard(wanted.screen, { item: wanted.itemId ? data.catalog.find(x => x.id === wanted.itemId) : live.current.item, fit, bag, order }));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Session persistence: survive refresh and app switches.
  useEffect(() => {
    if (!data) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      screen, itemId: item?.id ?? null, waist, len, answered, seenPhotoAsk,
      bag: bag ? { itemId: bag.item.id, waist: bag.waist, len: bag.len, garmentCm: bag.garmentCm } : null,
      order,
    }));
  }, [data, screen, item, waist, len, answered, seenPhotoAsk, bag, order]);

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
        onBag={bag ? () => setScreen("checkout") : undefined}
        bagCount={bag ? 1 : 0}
      />

      {screen === "home" && <Home catalog={data.catalog} onShop={() => setScreen("catalog")} onOpen={openItem} />}

      {screen === "catalog" && (
        <Catalog catalog={data.catalog} fit={fit} shoe={shoe} onOpen={openItem}
          onSetFit={() => setScreen("fitsetup")} onEditFit={() => setScreen("fitsetup")} />
      )}

      {screen === "fitsetup" && (
        <div style={{ overflowY: "auto", minHeight: 0, padding: "var(--space-6) var(--page-margin) var(--space-8)" }}>
          <FitSetup benchmarks={data.benchmarks} shoes={data.shoes} initialShoe={fit?.shoeId ?? "sneakers"}
            onDone={f => { setSetupFit(f); setScreen("fitconfirm"); }} />
        </div>
      )}

      {screen === "fitconfirm" && setupFit && (
        <div style={{ overflowY: "auto", minHeight: 0, padding: "var(--space-6) var(--page-margin) var(--space-8)" }}>
          <FitConfirm fit={setupFit} onContinue={() => { setFit(setupFit); setScreen("catalog"); }} />
        </div>
      )}

      {screen === "pdp" && item && (
        <Pdp item={item} verdict={verdict} answered={answered}
          waist={waist} onWaist={setWaist} len={len} onLen={setLen}
          onOpenVerdict={() => { setSheet(true); if (fit) setAnswered(true); }}
          onAdd={() => { setBag({ item, waist, len, garmentCm: length.inseamCm }); setScreen("checkout"); }} />
      )}

      {screen === "ask" && <TryOnAsk onPhoto={() => { setRenderSource("photo"); setSeenPhotoAsk(true); setScreen("render"); }} onAvatar={() => { setRenderSource("avatar"); setSeenPhotoAsk(true); setScreen("render"); }} />}

      {screen === "render" && item && fit && (
        <TryOnRender item={item} fit={fit} shoe={shoe} shoes={data.shoes} source={renderSource}
          onShoe={id => setFit({ ...fit, shoeId: id })}
          lengthLabel={length.label} verdict={verdict} hemPref={hemPref}
          onRetry={() => setScreen("ask")}
          onCheckout={() => { setBag({ item, waist, len: length.label, garmentCm: length.inseamCm }); setScreen("checkout"); }} />
      )}

      {screen === "checkout" && bag && (
        <Checkout bag={bag} verdict={verdict} shoe={shoe} hemPref={hemPref} onHemPref={setHemPref}
          order={order} itemShortName={shortName || bag.item.name.split(" ").slice(0, 2).join(" ")}
          onPlace={setOrder}
          onRestart={() => { setOrder(null); setBag(null); setScreen("home"); }} />
      )}

      {(screen === "home" || screen === "catalog") && (
        <TabBar active={screen === "home" ? "Home" : "Shop"}
          onGo={target => { if (target === "checkout" && !bag) return; setScreen(target); }} />
      )}

      {screen === "pdp" && item && (
        <BreakSheet open={sheet} item={item} lengthLabel={length?.label} fit={fit}
          shoes={data.shoes} benchmarks={data.benchmarks}
          onFit={f => { setFit(f); setAnswered(true); }}
          hemPref={hemPref} onHemPref={setHemPref}
          onClose={() => setSheet(false)}
          onSeeIt={() => { setSheet(false); setScreen(seenPhotoAsk ? "render" : "ask"); }} />
      )}
    </Shell>
  );
}
