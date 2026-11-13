import { useLocation } from "react-router-dom";

/**
 * Page wrapper: applies the route transition and the standard container.
 *
 * Keyed on the pathname so every navigation replays the fade-up transition,
 * while query-string-only changes (filters) keep the component mounted.
 */
export function Page({ children, className = "", container = true }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className={`page-enter ${className}`}>
      {container ? (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

export default Page;
