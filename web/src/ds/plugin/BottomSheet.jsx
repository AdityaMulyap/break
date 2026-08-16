import React from "react";

/** Bottom sheet over a dimmed screen — the same container the store uses for size charts. */
export function BottomSheet({ open = true, title, onClose, children, footer, style, ...rest }) {
  if (!open) return null;
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", alignItems: "end", zIndex: 20 }} {...rest}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "var(--surface-scrim)" }} />
      <div style={{ position: "relative", background: "var(--paper)", borderRadius: "var(--radius-plugin) var(--radius-plugin) 0 0", boxShadow: "var(--shadow-sheet)", maxHeight: "88%", display: "grid", gridTemplateRows: "auto 1fr auto", animation: "breakSheetIn var(--dur-sheet) var(--ease-out)", ...style }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", padding: "var(--space-4) var(--page-margin)", borderBottom: "var(--hairline)" }}>
          <span>{title}</span>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div style={{ padding: "var(--space-5) var(--page-margin)", overflowY: "auto" }}>{children}</div>
        {footer ? <div style={{ padding: "var(--space-4) var(--page-margin) var(--space-6)", borderTop: "var(--hairline)" }}>{footer}</div> : null}
        <style>{"@keyframes breakSheetIn{from{transform:translateY(16px);opacity:.4}to{transform:none;opacity:1}}"}</style>
      </div>
    </div>
  );
}
