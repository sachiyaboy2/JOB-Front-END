import { Link, useParams } from "react-router-dom";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import JobCard from "../../components/ui/JobCard.jsx";
import { CompanyMark } from "../../components/ui/JobCard.jsx";
import { JobCardSkeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { apiErrorMessage, companiesApi, jobsApi } from "../../api.js";
import { toArray, toEntity } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";

export default function CompanyDetail() {
  const { id } = useParams();

  const { data, loading, error, reload } = useFetch(() => companiesApi.get(id), [id]);
  const company = toEntity(data) || {};

  useDocumentTitle(company?.name || "Company");

  // The company payload may already carry its jobs; otherwise we look them up
  // by name and keep only the matches.
  const embeddedJobs = toArray(company?.jobs);
  const { data: lookupJobs } = useFetch(
    () => (embeddedJobs.length ? Promise.resolve(null) : jobsApi.list({ limit: 12, q: company?.name || "" })),
    [id, company?.name, embeddedJobs.length],
  );

  const listed = toArray(lookupJobs);
  const jobs = embeddedJobs.length
    ? embeddedJobs
    : listed.filter((job) => {
        const name = job.companyName || job.company?.name || job.company || "";
        return !company?.name || String(name).toLowerCase() === String(company.name).toLowerCase();
      });

  if (loading) {
    return (
      <Page>
        <div className="surface p-8">
          <div className="flex items-center gap-4">
            <div className="skeleton h-20 w-20 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-3 w-1/4" />
            </div>
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <ErrorState
          title="We could not load this company"
          message={apiErrorMessage(error, "The company profile may have been removed.")}
          onRetry={reload}
        />
      </Page>
    );
  }

  return (
    <Page>
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex items-center gap-1.5 text-xs text-ink-muted">
          <li>
            <Link to="/companies" className="hover:text-ink hover:underline">
              Companies
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevronRight" size={12} />
          </li>
          <li aria-current="page" className="text-ink-2">
            {company?.name}
          </li>
        </ol>
      </nav>

      <header className="card-glow surface p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-5">
          <CompanyMark logo={company.logo} name={company.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {company?.name || "Company"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-muted">
              {company?.industry ? (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="layers" size={14} /> {company.industry}
                </span>
              ) : null}
              {company?.location || company?.address ? (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="mapPin" size={14} /> {company.location || company.address}
                </span>
              ) : null}
              {company?.website ? (
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-aurora-600 hover:underline dark:hover:text-aurora-300"
                >
                  <Icon name="globe" size={14} /> Website
                </a>
              ) : null}
            </div>
            {company?.verified || company?.status === "verified" ? (
              <span className="badge badge-success mt-3">
                <Icon name="shield" size={12} /> Verified employer
              </span>
            ) : null}
          </div>
        </div>

        {company?.description ? (
          <p className="mt-6 max-w-3xl text-pretty leading-relaxed text-ink-2">{company.description}</p>
        ) : null}
      </header>

      <section aria-labelledby="company-jobs" className="mt-8">
        <h2 id="company-jobs" className="font-display text-2xl font-bold tracking-tight text-ink">
          Open roles
        </h2>
        <div className="mt-5">
          {lookupJobs === null && embeddedJobs.length === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon="briefcase"
              title="No open roles right now"
              message="This company is not advertising any positions at the moment."
              action={
                <Link to="/jobs" className="btn btn-primary">
                  Browse other jobs
                </Link>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, index) => (
                <JobCard key={job._id || job.id || index} job={job} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Page>
  );
}
