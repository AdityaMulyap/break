import React from "react";
import { Wordmark } from "../ds";

/** Responsive shell: full-viewport on phones, a framed 390px column on desktop. */
export function Shell({ children }) {
  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center", padding: "env(safe-area-inset-top) 0 env(safe-area-inset-bottom)" }}>
      <div
        style={{
          width: "min(390px, 100vw)",
          height: "min(844px, 100dvh)",
          background: "var(--paper)",
          border: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 1fr auto auto",
          boxShadow: "0 24px 64px rgba(26,26,26,.10)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function StoreHeader({ onBack, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", height: 52, padding: "0 var(--page-margin)", borderBottom: "var(--hairline)", background: "var(--paper)", position: "relative", zIndex: 5 }}>
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Back" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      ) : null}
      <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>{title || <Wordmark />}</div>
      <div style={{ width: 18 }} />
    </div>
  );
}

export function Scroll({ children, pad = true }) {
  return <div style={{ overflowY: "auto", padding: pad ? "var(--space-6) var(--page-margin) var(--space-8)" : 0 }}>{children}</div>;
}

export function H1({ children, style }) {
  return <h1 style={{ font: "var(--text-h1)", margin: 0, color: "var(--text-primary)", textWrap: "pretty", ...style }}>{children}</h1>;
}

export function Sub({ children }) {
  return <p style={{ font: "var(--text-body-role)", color: "var(--text-secondary)", margin: 0, textWrap: "pretty" }}>{children}</p>;
}

/** Bottom action area pinned under the scroll region. */
export function FootBar({ children }) {
  return <div style={{ padding: "var(--space-3) var(--page-margin)", borderTop: "var(--hairline)", background: "var(--paper)" }}>{children}</div>;
}

const ICONS = {
  Home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  Shop: <path d="M4 7h16l-1.5 13h-13L4 7zm4 0a4 4 0 0 1 8 0" />,
  Favorites: <path d="M12 20s-7-4.6-9-9c-1.2-2.7.6-6 3.8-6 2 0 3.4 1.2 5.2 3.2C13.8 6.2 15.2 5 17.2 5c3.2 0 5 3.3 3.8 6-2 4.4-9 9-9 9z" />,
  Bag: <path d="M5 8h14v13H5V8zm3 0a4 4 0 0 1 8 0" />,
  Account: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" /></>,
};

/** Store tab bar, per the prototype: Home · Shop · Favorites · Bag · Account. */
export function TabBar({ active, onGo }) {
  return (
    <nav style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", borderTop: "var(--hairline)", background: "var(--paper)", padding: "6px 0 calc(6px + env(safe-area-inset-bottom))" }}>
      {Object.entries(ICONS).map(([name, glyph]) => {
        const on = active === name;
        const go = { Home: "home", Shop: "catalog", Bag: "checkout" }[name];
        return (
          <button key={name} type="button" onClick={go ? () => onGo(go) : undefined} aria-current={on ? "page" : undefined} style={{ display: "grid", justifyItems: "center", gap: 2, background: "none", border: "none", padding: "4px 0", cursor: go ? "pointer" : "default", color: on ? "var(--accent)" : "var(--text-muted)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{glyph}</svg>
            <span style={{ font: "var(--text-tiny-role)", fontSize: 10 }}>{name}</span>
          </button>
        );
      })}
    </nav>
  );
}
