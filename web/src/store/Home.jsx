import React from "react";
import { ProductCard, Button } from "../ds";
import { Scroll } from "./Frame.jsx";

// Hero copy sits on the photo, per the prototype video.
export function Home({ catalog, onShop, onOpen }) {
  const arrivals = catalog.slice(0, 4);
  return (
    <Scroll pad={false}>
      <div style={{ position: "relative" }}>
        <img src="/img/hero.jpg" alt="Fall denim" style={{ display: "block", width: "100%", aspectRatio: "4 / 5", objectFit: "cover" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "var(--space-8) var(--page-margin) var(--space-5)", background: "linear-gradient(to top, rgba(26,26,26,.55), transparent)", display: "grid", gap: "var(--space-3)", justifyItems: "start" }}>
          <h1 style={{ font: "var(--text-h1)", color: "#fff", margin: 0, textWrap: "balance" }}>Cut for how you actually wear them</h1>
          <Button onClick={onShop} style={{ background: "#fff", color: "var(--ink)" }}>Shop women's jeans</Button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: "2px 0" }}>
        {[{ label: "WOMEN", img: "/img/catalog/g2.jpg", go: onShop }, { label: "MEN", img: "/img/catalog/g3.jpg", go: onShop }].map(t => (
          <button key={t.label} type="button" onClick={t.go} style={{ position: "relative", border: "none", padding: 0, cursor: "pointer", background: "none" }}>
            <img src={t.img} alt={t.label} style={{ display: "block", width: "100%", aspectRatio: "4 / 3", objectFit: "cover", filter: "brightness(.82)" }} />
            <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", font: "var(--text-small-role)", letterSpacing: "var(--ls-label)", fontWeight: "var(--fw-semibold)" }}>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: "var(--space-5) var(--page-margin) var(--space-8)", display: "grid", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>New arrivals</span>
          <button type="button" onClick={onShop} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-small-role)", color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "3px" }}>View all</button>
        </div>
        <div style={{ display: "flex", gap: "var(--space-3)", overflowX: "auto", margin: "0 calc(-1 * var(--page-margin))", padding: "0 var(--page-margin)" }}>
          {arrivals.map(i => (
            <ProductCard key={i.id} name={i.name.split(" in ")[0]} wash={i.wash} price={"$" + i.priceUsd}
              compareAt={i.compareAtUsd ? "$" + i.compareAtUsd : undefined}
              src={i.image} onClick={() => onOpen(i)} style={{ width: 132, flex: "0 0 auto" }} />
          ))}
        </div>
      </div>
    </Scroll>
  );
}
