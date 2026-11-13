import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import Drawer from "../../components/ui/Drawer.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import JobCard from "../../components/ui/JobCard.jsx";
import JobFilters from "../../components/jobs/JobFilters.jsx";
import { JobCardSkeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useReference } from "../../context/ReferenceContext.jsx";
import { apiErrorMessage, jobsApi } from "../../api.js";
import { readMeta, toArray } from "../../utils/data.js";
import { useDebounce, useDocumentTitle } from "../../utils/hooks.js";
import { SORT_OPTIONS } from "../../utils/constants.js";

const DEFAULTS = {
  q: "",
  category: "",
  district: "",
  salaryMin: "",
  salaryMax: "",
  employmentType: "",
  workMode: "",
  experienceLevel: "",
  educationLevel: "",
  sort: "newest",
  page: 1,
  limit: 12,
};

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const { isAuthenticated, isSeeker } = useAuth();
  const { categories, districts } = useReference();

  const [keyword, setKeyword] = useState(() => params.get("q") || "");
  const [view, setView] = useState(() => {
    try {
      return window.localStorage.getItem("ob.jobsView") === "list" ? "list" : "card";
    } catch {
      return "card";
    }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedIds, setSavedIds] = useState(() => new Set());

  const debouncedKeyword = useDebounce(keyword, 400);

  useDocumentTitle("Browse jobs");

  const filters = useMemo(
    () => ({
      q: params.get("q") || "",
      category: params.get("category") || "",
      district: params.get("district") || "",
      salaryMin: params.get("salaryMin") || "",
      salaryMax: params.get("salaryMax") || "",
      employmentType: params.get("employmentType") || "",
      workMode: params.get("workMode") || "",
      experienceLevel: params.get("experienceLevel") || "",
      educationLevel: params.get("educationLevel") || "",
      sort: params.get("sort") || "newest",
      page: Number(params.get("page") || 1),
      limit: Number(params.get("limit") || 12),
    }),
    [params],
  );

  // Keep the keyword input in sync when the URL changes from elsewhere.
  useEffect(() => {
    const urlKeyword = params.get("q") || "";
    setKeyword((current) => (current === urlKeyword ? current : urlKeyword));
  }, [params]);

  // Typing pushes the keyword into the URL after the debounce.
  useEffect(() => {
    if (debouncedKeyword === (params.get("q") || "")) return;
    const next = new URLSearchParams(params);
    if (debouncedKeyword) next.set("q", debouncedKeyword);
    else next.delete("q");
    next.delete("page");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  const query = useMemo(() => {
    const q = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined && !(key === "page" && value === 1)) {
        q[key] = value;
      }
    });
    return q;
  }, [filters]);

  const { data, meta, loading, error, reload } = useFetchJobs(query);

  // Saved jobs, so the bookmark icon reflects the real state.
  useEffect(() => {
    if (!isAuthenticated || !isSeeker) return;
    let cancelled = false;
    jobsApi
      .saved()
      .then((payload) => {
        if (cancelled) return;
        const list = toArray(payload);
        setSavedIds(new Set(list.map((job) => String(job._id || job.id))));
      })
      .catch(() => {
        /* the heart stays neutral when the service is down */
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isSeeker, data]);

  const updateFilters = useCallback(
    (next) => {
      const search = new URLSearchParams();
      Object.entries(next).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) return;
        if (key === "page" && Number(value) === 1) return;
        if (key === "limit" && Number(value) === 12) return;
        if (key === "sort" && value === "newest") return;
        search.set(key, String(value));
      });
      setParams(search, { replace: false });
    },
    [setParams],
  );

  const toggleSave = useCallback(
    async (job) => {
      if (!isAuthenticated) {
        toast("Sign in to save jobs", { icon: "🔒" });
        return;
      }
      const id = job.id;
      const key = String(id);
      try {
        if (savedIds.has(key)) {
          await jobsApi.unsave(id);
          setSavedIds((current) => {
            const next = new Set(current);
            next.delete(key);
            return next;
          });
          toast.success("Removed from saved jobs");
        } else {
          await jobsApi.save(id);
          setSavedIds((current) => new Set(current).add(key));
          toast.success("Job saved");
        }
      } catch (err) {
        toast.error(apiErrorMessage(err, "Could not update saved jobs."));
      }
    },
    [isAuthenticated, savedIds],
  );

  const changeView = (next) => {
    setView(next);
    try {
      window.localStorage.setItem("ob.jobsView", next);
    } catch {
      /* ignore */
    }
  };

  const jobs = toArray(data);
  const pagination = readMeta(data, meta, jobs.length);
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      value !== "" &&
      key !== "q" &&
      key !== "sort" &&
      key !== "page" &&
      key !== "limit",
  ).length;

  return (
    <Page>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Browse jobs</h1>
        <p className="mt-2 text-ink-muted">
          Search openings across Sri Lanka by keyword, category, district, salary and working style.
        </p>
      </div>

      {/* ---- Search bar ---- */}
      <form
        role="search"
        aria-label="Search jobs"
        onSubmit={(event) => {
          event.preventDefault();
          updateFilters({ ...filters, q: keyword.trim(), page: 1 });
        }}
        className="mt-7 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <label htmlFor="jobs-keyword" className="sr-only">
            Search by keyword
          </label>
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
            <Icon name="search" size={17} />
          </span>
          <input
            id="jobs-keyword"
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Job title, skill, company or keyword"
            className="field !pl-10"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          <Icon name="search" size={16} />
          Search
        </button>

        <button
          type="button"
          className="btn btn-secondary lg:hidden"
          onClick={() => setDrawerOpen(true)}
          aria-label={`Open filters${activeFilterCount ? `, ${activeFilterCount} active` : ""}`}
        >
          <Icon name="filter" size={16} />
          Filters
          {activeFilterCount ? <span className="badge badge-accent !px-1.5 !py-0 !text-[10px]">{activeFilterCount}</span> : null}
        </button>
      </form>

      <div className="mt-7 grid gap-6 lg:grid-cols-[268px_minmax(0,1fr)]">
        {/* ---- Desktop filters ---- */}
        <aside className="hidden lg:block">
          <div className="surface sticky top-24 p-5">
            <h2 className="font-display text-base font-semibold text-ink">Refine results</h2>
            <p className="mt-1 text-xs text-ink-muted">Narrow down the list to find the right role.</p>
            <div className="mt-5">
              <JobFilters
                filters={filters}
                onChange={updateFilters}
                categories={categories}
                districts={districts}
                onReset={() => updateFilters({ ...DEFAULTS, q: filters.q })}
              />
            </div>
          </div>
        </aside>

        {/* ---- Results ---- */}
        <section aria-label="Job results" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted" role="status" aria-live="polite">
              {loading ? "Searching…" : `${pagination.total} ${pagination.total === 1 ? "job" : "jobs"} found`}
            </p>

            <div className="flex items-center gap-2">
              <div>
                <label htmlFor="jobs-sort" className="sr-only">
                  Sort jobs
                </label>
                <select
                  id="jobs-sort"
                  value={filters.sort}
                  onChange={(event) => updateFilters({ ...filters, sort: event.target.value, page: 1 })}
                  className="field !w-auto !py-2"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex rounded-md border border-line bg-surface p-0.5" role="group" aria-label="Result layout">
                <button
                  type="button"
                  onClick={() => changeView("card")}
                  aria-pressed={view === "card"}
                  aria-label="Card view"
                  className={`btn !px-2 !py-1.5 ${view === "card" ? "btn-primary" : "btn-ghost"}`}
                >
                  <Icon name="grid" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => changeView("list")}
                  aria-pressed={view === "list"}
                  aria-label="List view"
                  className={`btn !px-2 !py-1.5 ${view === "list" ? "btn-primary" : "btn-ghost"}`}
                >
                  <Icon name="list" size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <div className={view === "card" ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <JobCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <ErrorState
                title="We could not load the jobs"
                message={apiErrorMessage(error, "The jobs service is not responding right now.")}
                onRetry={reload}
              />
            ) : jobs.length === 0 ? (
              <EmptyState
                icon="search"
                title="No jobs match those filters"
                message="Try a broader keyword, or clear a filter or two and search again."
                action={
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => updateFilters({ ...DEFAULTS })}
                  >
                    Clear all filters
                  </button>
                }
              />
            ) : view === "card" ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job, index) => (
                  <JobCard
                    key={job._id || job.id || index}
                    job={job}
                    index={index}
                    saved={savedIds.has(String(job._id || job.id))}
                    onToggleSave={toggleSave}
                    canSave={isAuthenticated}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <JobCard
                    key={job._id || job.id || index}
                    job={job}
                    variant="list"
                    index={index}
                    saved={savedIds.has(String(job._id || job.id))}
                    onToggleSave={toggleSave}
                    canSave={isAuthenticated}
                  />
                ))}
              </div>
            )}
          </div>

          {pagination.pages > 1 ? (
            <Pagination
              className="mt-8"
              page={pagination.page}
              pages={pagination.pages}
              onChange={(page) => {
                updateFilters({ ...filters, page });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ) : null}
        </section>
      </div>

      {/* ---- Mobile filter drawer ---- */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filter jobs"
        footer={
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => updateFilters({ ...DEFAULTS, q: filters.q })}
            >
              Clear
            </button>
            <button type="button" className="btn btn-primary flex-1" onClick={() => setDrawerOpen(false)}>
              Show results
            </button>
          </div>
        }
      >
        <JobFilters
          filters={filters}
          onChange={updateFilters}
          categories={categories}
          districts={districts}
          onReset={() => updateFilters({ ...DEFAULTS, q: filters.q })}
        />
      </Drawer>
    </Page>
  );
}

/**
 * Small wrapper so the query object identity only changes when the filters
 * actually change (the fetch hook depends on the object).
 */
function useFetchJobs(query) {
  const queryKey = JSON.stringify(query);
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const payload = await jobsApi.list(query);
      setState({
        data: payload,
        meta: payload?.meta || null,
        loading: false,
        error: null,
      });
    } catch (err) {
      setState({ data: null, meta: null, loading: false, error: err });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
