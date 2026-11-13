import Icon from "./Icon.jsx";

/**
 * Pagination control — previous / next plus a window of page numbers.
 */
export function Pagination({ page = 1, pages = 1, onChange, className = "" }) {
  if (!pages || pages <= 1) return null;

  const windowSize = 2;
  const start = Math.max(1, page - windowSize);
  const end = Math.min(pages, page + windowSize);
  const numbers = [];
  for (let i = start; i <= end; i += 1) numbers.push(i);

  const go = (next) => {
    if (next < 1 || next > pages || next === page) return;
    onChange?.(next);
  };

  return (
    <nav className={`flex items-center justify-center gap-1.5 ${className}`} aria-label="Pagination">
      <button
        type="button"
        className="btn btn-secondary !px-2.5"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <Icon name="chevronLeft" size={16} />
      </button>

      {start > 1 ? (
        <>
          <button type="button" className="btn btn-ghost !px-3" onClick={() => go(1)} aria-label="Go to page 1">
            1
          </button>
          {start > 2 ? <span className="px-1 text-ink-muted">…</span> : null}
        </>
      ) : null}

      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => go(n)}
          aria-label={`Go to page ${n}`}
          aria-current={n === page ? "page" : undefined}
          className={`btn !px-3 ${n === page ? "btn-primary" : "btn-ghost"}`}
        >
          {n}
        </button>
      ))}

      {end < pages ? (
        <>
          {end < pages - 1 ? <span className="px-1 text-ink-muted">…</span> : null}
          <button type="button" className="btn btn-ghost !px-3" onClick={() => go(pages)} aria-label={`Go to page ${pages}`}>
            {pages}
          </button>
        </>
      ) : null}

      <button
        type="button"
        className="btn btn-secondary !px-2.5"
        onClick={() => go(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
      >
        <Icon name="chevronRight" size={16} />
      </button>
    </nav>
  );
}

export default Pagination;
