import Icon from "./Icon.jsx";

/**
 * Error state — a readable message and a "Try again" button.
 * Rendered with `role="alert"` so screen readers announce it.
 */
export function ErrorState({ title = "We could not load this", message = "", onRetry, className = "", compact = false }) {
  return (
    <div
      role="alert"
      className={`surface border-danger/30 bg-danger/[0.04] flex flex-col items-center justify-center px-6 text-center ${
        compact ? "py-8" : "py-14"
      } ${className}`}
    >
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <Icon name="alert" size={26} />
      </span>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {message ? <p className="mt-1.5 max-w-md text-sm text-ink-muted">{message}</p> : null}
      {onRetry ? (
        <button type="button" className="btn btn-secondary mt-5" onClick={onRetry}>
          <Icon name="refresh" size={16} />
          Try again
        </button>
      ) : null}
    </div>
  );
}

export default ErrorState;
