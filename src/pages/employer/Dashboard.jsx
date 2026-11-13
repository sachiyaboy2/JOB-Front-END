import { Link } from "react-router-dom";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { Reveal } from "../../components/brand/useReveal.jsx";
import { TableSkeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { apiErrorMessage, applicationsApi, jobsApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { formatDate, timeAgo } from "../../utils/format.js";

export default function EmployerDashboard() {
  useDocumentTitle("Employer dashboard");

  const jobs = useFetch(() => jobsApi.mine(), []);
  const applications = useFetch(() => applicationsApi.forJob(undefined), []);

  const jobList = toArray(jobs.data);
  const applicationList = toArray(applications.data);

  const counts = {
    total: jobList.length,
    active: jobList.filter((job) => ["approved", "pending"].includes(job.status)).length,
    applications: applicationList.length,
    shortlisted: applicationList.filter((a) => a.status === "shortlisted").length,
  };

  const recent = [...applicationList]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  return (
    <Page>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Employer dashboard</h1>
          <p className="mt-2 text-ink-muted">Your vacancies and candidates at a glance.</p>
        </div>
        <Link to="/employer/jobs/new" className="btn btn-primary">
          <Icon name="plus" size={16} />
          Post a job
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total jobs" value={counts.total} icon="briefcase" tone="aurora" />
        <StatCard label="Active vacancies" value={counts.active} icon="target" tone="cyan" />
        <StatCard label="Applications" value={counts.applications} icon="users" tone="violet" />
        <StatCard label="Shortlisted" value={counts.shortlisted} icon="star" tone="success" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section aria-labelledby="employer-jobs" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="employer-jobs" className="font-display text-xl font-semibold text-ink">
              Your jobs
            </h2>
            <Link to="/employer/jobs" className="btn btn-ghost">
              Manage all
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>

          <div className="mt-4">
            {jobs.loading ? (
              <TableSkeleton rows={4} />
            ) : jobs.error ? (
              <ErrorState
                title="We could not load your jobs"
                message={apiErrorMessage(jobs.error, "The jobs service is not responding.")}
                onRetry={jobs.reload}
              />
            ) : jobList.length === 0 ? (
              <EmptyState
                icon="briefcase"
                title="No jobs posted yet"
                message="Publish your first vacancy and start receiving applications."
                action={
                  <Link to="/employer/jobs/new" className="btn btn-primary">
                    Post a job
                  </Link>
                }
              />
            ) : (
              <div className="table-shell overflow-x-auto">
                <table>
                  <caption className="sr-only">Your job postings</caption>
                  <thead>
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Posted</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobList.slice(0, 6).map((job) => (
                      <tr key={job._id || job.id}>
                        <td>
                          <span className="font-medium text-ink">{job.title}</span>
                          <span className="block text-xs text-ink-muted">{job.location}</span>
                        </td>
                        <td className="whitespace-nowrap text-ink-muted">{formatDate(job.createdAt)}</td>
                        <td>
                          <StatusBadge status={job.status} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <section aria-labelledby="employer-activity" className="surface p-6">
            <h2 id="employer-activity" className="font-display text-base font-semibold text-ink">
              Recent activity
            </h2>
            <div className="mt-4">
              {applications.loading ? (
                <TableSkeleton rows={3} />
              ) : applications.error ? (
                <p className="text-sm text-ink-muted">Activity is unavailable right now.</p>
              ) : recent.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  No applications yet. Once a role is live, every new application appears here.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recent.map((application) => {
                    const seeker = application.seeker || application.user || {};
                    const job = application.job || {};
                    const name = seeker.name || application.applicantName || "A candidate";
                    return (
                      <li key={application._id || application.id} className="flex items-start gap-3">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                          <Icon name="user" size={15} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{name}</p>
                          <p className="truncate text-xs text-ink-muted">
                            applied for {job.title || "your role"} · {timeAgo(application.createdAt)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>

          <div className="card-glow surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">Next steps</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { to: "/employer/company", label: "Complete your company profile", icon: "building" },
                { to: "/employer/jobs/new", label: "Post a new vacancy", icon: "plus" },
                { to: "/employer/applicants", label: "Review your applicants", icon: "users" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex items-center gap-3 rounded-md p-2 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-aurora-600 dark:text-aurora-300">
                      <Icon name={item.icon} size={15} />
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Page>
  );
}
