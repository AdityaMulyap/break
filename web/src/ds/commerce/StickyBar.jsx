import React from "react";
import { Button } from "../core/Button.jsx";

/** Fixed PDP footer: heart + full-width Add To Bag. */
export function StickyBar({ label = "Add To Bag", saved = false, onSave, onAction, disabled = false, style, ...rest }) {
  return (
    <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", padding: "var(--space-3) var(--page-margin)", background: "var(--paper)", borderTop: "var(--hairline)", ...style }} {...rest}>
      <button type="button" onClick={onSave} aria-label="Save" style={{ width: "var(--tap-min)", height: "var(--tap-min)", flex: "0 0 auto", display: "grid", placeItems: "center", background: "var(--paper)", border: "var(--hairline)", borderRadius: "var(--radius-store)", cursor: "pointer" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "var(--ink)" : "none"} stroke="var(--ink)" strokeWidth="1.6"><path d="M12 20s-7-4.6-7-9.4A4.1 4.1 0 0 1 12 8a4.1 4.1 0 0 1 7 2.6C19 15.4 12 20 12 20z" /></svg>
      </button>
      <Button full disabled={disabled} onClick={onAction}>{label}</Button>
    </div>
  );
}
