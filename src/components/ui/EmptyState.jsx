import Icon from "./Icon.jsx";

/**
 * Empty state — an icon, one line of copy and a single action.
 * Used whenever a list comes back with nothing in it.
 */
export function EmptyState({ icon = "inbox", title = "Nothing here yet", message = "", action = null, className = "" }) {
  return (
    <div className={`surface flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-aurora-500 shadow-e1">
        <Icon name={icon} size={26} />
      </span>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {message ? <p className="mt-1.5 max-w-sm text-sm text-ink-muted">{message}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
