import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon.jsx";

/**
 * Slide-in drawer used for the job filters on small screens.
 * Closes on Escape and on backdrop click, and locks body scroll while open.
 */
export function Drawer({ open, onClose, title = "Filters", children, footer = null }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const timer = window.setTimeout(() => {
      const node = panelRef.current?.querySelector("button, input, select, a");
      node?.focus();
    }, 40);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="surface-elevated absolute inset-y-0 right-0 flex w-[92%] max-w-md flex-col rounded-l-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <button type="button" className="btn btn-ghost !px-2" onClick={onClose} aria-label="Close filters">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="scroll-slim flex-1 overflow-y-auto px-5 py-4">{children}</div>

        <div className="border-t border-line bg-surface-2/60 px-5 py-3.5">
          {footer ?? (
            <button type="button" className="btn btn-primary w-full" onClick={onClose}>
              Show results
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default Drawer;
