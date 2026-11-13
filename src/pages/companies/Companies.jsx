import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import CompanyCard from "../../components/ui/CompanyCard.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { apiErrorMessage, companiesApi } from "../../api.js";
import { readMeta, toArray } from "../../utils/data.js";
import { useDebounce, useDocumentTitle, useFetch } from "../../utils/hooks.js";

export default function Companies() {
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(() => params.get("q") || "");
  const [page, setPage] = useState(Number(params.get("page") || 1));

  const debounced = useDebounce(keyword, 400);
  useDocumentTitle("Companies");

  const query = useMemo(
    () => ({ q: debounced, page, limit: 12 }),
    [debounced, page],
  );

  const { data, meta, loading, error, reload } = useFetch(() => companiesApi.list(query), [query]);

  const companies = toArray(data);
  const pagination = readMeta(data, meta, companies.length);

  const updatePage = (next) => {
    setPage(next);
    const search = new URLSearchParams(params);
    if (next === 1) search.delete("page");
    else search.set("page", String(next));
    setParams(search, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Page>
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Company directory</h1>
        <p className="mt-2 text-ink-muted">
          Explore verified employers hiring across Sri Lanka — from start-ups to established enterprises.
        </p>
      </div>

      <form
        role="search"
        aria-label="Search companies"
        onSubmit={(event) => {
          event.preventDefault();
          updatePage(1);
        }}
        className="mt-7 max-w-xl"
      >
        <label htmlFor="companies-keyword" className="sr-only">
          Search companies
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
            <Icon name="search" size={17} />
          </span>
          <input
            id="companies-keyword"
            type="search"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value);
              setPage(1);
            }}
            placeholder="Search by company name or industry"
            className="field !pl-10"
          />
        </div>
      </form>

      <div className="mt-7">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="surface p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="mt-4 h-3 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="We could not load the directory"
            message={apiErrorMessage(error, "The companies service is not responding right now.")}
            onRetry={reload}
          />
        ) : companies.length === 0 ? (
          <EmptyState
            icon="building"
            title="No companies found"
            message="Try a different company name or check back soon."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, index) => (
              <CompanyCard key={company._id || company.id || index} company={company} index={index} />
            ))}
          </div>
        )}
      </div>

      <Pagination className="mt-8" page={pagination.page} pages={pagination.pages} onChange={updatePage} />
    </Page>
  );
}
