import { Link } from "react-router-dom";

import Page from "../components/layout/Page.jsx";
import Icon from "../components/ui/Icon.jsx";
import { useDocumentTitle } from "../utils/hooks.js";

export default function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <Page>
      <div className="mx-auto flex max-w-lg flex-col items-center py-16 text-center">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-aurora-500 to-violet-glow text-white shadow-e3">
          <Icon name="search" size={34} />
        </span>
        <p className="mt-6 font-mono text-sm font-semibold uppercase tracking-widest text-aurora-600 dark:text-aurora-300">
          404
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          We could not find that page
        </h1>
        <p className="mt-3 text-pretty text-ink-muted">
          The link may be broken, or the page may have been moved. Let us get you back to something useful.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-primary">
            Back to home
            <Icon name="arrowRight" size={16} />
          </Link>
          <Link to="/jobs" className="btn btn-secondary">
            Browse jobs
          </Link>
        </div>
      </div>
    </Page>
  );
}
