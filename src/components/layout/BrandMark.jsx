import { Link } from "react-router-dom";

/**
 * Brand lockup — an aurora gradient mark plus the wordmark.
 * The gradient uses brand tokens only, so it reads the same in both themes.
 */
export function BrandMark({ compact = false, className = "" }) {
  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Jobelza — home"
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-500 via-aurora-600 to-violet-glow shadow-e2 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 8.5h16M4 8.5v10a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-10M4 8.5 6.4 5h11.2L20 8.5M10 13h4"
            stroke="#fff"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className="block font-display text-[17px] font-extrabold tracking-tight text-ink">
            Jobelza
          </span>
          <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Sri Lanka
          </span>
        </span>
      ) : null}
    </Link>
  );
}

export default BrandMark;
