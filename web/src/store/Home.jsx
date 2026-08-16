import React from "react";
import { PhotoFrame, ProductCard, Button } from "../ds";
import { Scroll, H1 } from "./Frame.jsx";

export function Home({ catalog, onShop, onOpen }) {
  const arrivals = catalog.slice(0, 2);
  return (
    <Scroll pad={false}>
      <PhotoFrame ratio="4 / 5" label="FALL DENIM" src="/img/hero.jpg" alt="Fall denim" style={{ borderRadius: 0 }} />
      <div style={{ padding: "var(--space-5) var(--page-margin) var(--space-8)", display: "grid", gap: "var(--space-6)" }}>
        <div style={{ display: "grid", gap: "var(--space-3)", justifyItems: "start" }}>
          <H1>Cut for how you actually wear them</H1>
          <Button onClick={onShop}>Shop women's jeans</Button>
        </div>
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ font: "var(--text-tiny-role)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>New arrivals</span>
            <button type="button" onClick={onShop} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "var(--text-small-role)", color: "var(--text-link)", textDecoration: "underline", textUnderlineOffset: "3px" }}>View all</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6) var(--space-3)" }}>
            {arrivals.map(i => (
              <ProductCard key={i.id} name={i.name} wash={i.wash} price={"$" + i.priceUsd} src={i.image} onClick={() => onOpen(i)} />
            ))}
          </div>
        </div>
      </div>
    </Scroll>
  );
}
