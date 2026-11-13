import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";

/**
 * Page heading used on every inner page — title, optional lead line and a
 * row of actions. Keeps the vertical rhythm consistent across the app.
 */
export function PageHeader({ title, subtitle = "", actions = null, breadcrumbs = null, icon = null, className = "" }) {
  return (
    <header className={`mb-7 ${className}`}>
      {breadcrumbs && breadcrumbs.length ? (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? <Icon name="chevronRight" size={12} className="opacity-60" /> : null}
                {crumb.to ? (
                  <Link to={crumb.to} className="rounded-xs transition-colors hover:text-ink hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink-2">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {icon ? (
              <span className="mr-2.5 inline-flex h-9 w-9 translate-y-0.5 items-center justify-center rounded-lg bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                <Icon name={icon} size={19} />
              </span>
            ) : null}
            {title}
          </h1>
          {subtitle ? <p className="mt-2 max-w-2xl text-pretty text-ink-muted">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export default PageHeader;
