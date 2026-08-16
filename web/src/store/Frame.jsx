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
          gridTemplateRows: "auto 1fr auto",
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
