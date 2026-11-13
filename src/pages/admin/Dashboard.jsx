import { Link } from "react-router-dom";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import { Reveal } from "../../components/brand/useReveal.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { adminApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";

export default function AdminDashboard() {
  useDocumentTitle("Admin overview");

  const overview = useFetch(() => adminApi.overview(), []);
  const pendingJobs = useFetch(() => adminApi.pendingJobs(), []);
  const pendingEmployers = useFetch(() => adminApi.pendingEmployers(), []);

  const stats = overview.data || {};
  const jobs = toArray(pendingJobs.data);
  const employers = toArray(pendingEmployers.data);

  const cards = [
    { label: "Total users", value: stats.totalUsers ?? stats.users ?? null, icon: "users", tone: "aurora" },
    { label: "Total jobs", value: stats.totalJobs ?? stats.jobs ?? null, icon: "briefcase", tone: "cyan" },
    { label: "Applications", value: stats.totalApplications ?? stats.applications ?? null, icon: "fileText", tone: "violet" },
    { label: "Employers", value: stats.totalEmployers ?? stats.employers ?? null, icon: "building", tone: "success" },
    { label: "Pending jobs", value: stats.pendingJobs ?? jobs.length, icon: "clock", tone: "warning" },
    { label: "Pending employers", value: stats.pendingEmployers ?? employers.length, icon: "shield", tone: "danger" },
  ];

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Platform overview</h1>
        <p className="mt-2 text-ink-muted">
          How the marketplace is doing and what needs your attention right now.
        </p>
      </header>

      {overview.loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : overview.error ? (
        <ErrorState
          title="We could not load the overview"
          message="The admin service is not responding. Use the pages in the sidebar to work directly with the data."
          onRetry={overview.reload}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value === null ? 0 : card.value}
              icon={card.icon}
              tone={card.tone}
            />
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <section aria-labelledby="admin-pending-jobs" className="surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="admin-pending-jobs" className="font-display text-lg font-semibold text-ink">
                Job adverts awaiting review
              </h2>
              <Link to="/admin/approvals" className="btn btn-ghost">
                Review
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>

            <div className="mt-4">
              {pendingJobs.loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : pendingJobs.error ? (
                <p className="text-sm text-ink-muted">Pending adverts are unavailable right now.</p>
              ) : jobs.length === 0 ? (
                <p className="text-sm text-ink-muted">Nothing waiting — every advert has been reviewed.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {jobs.slice(0, 5).map((job) => (
                    <li key={job._id || job.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{job.title}</p>
                        <p className="truncate text-xs text-ink-muted">{job.companyName || "Employer"}</p>
                      </div>
                      <span className="badge badge-warning shrink-0">Pending</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section aria-labelledby="admin-pending-employers" className="surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="admin-pending-employers" className="font-display text-lg font-semibold text-ink">
                Employers awaiting verification
              </h2>
              <Link to="/admin/approvals" className="btn btn-ghost">
                Review
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>

            <div className="mt-4">
              {pendingEmployers.loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : pendingEmployers.error ? (
                <p className="text-sm text-ink-muted">Pending employers are unavailable right now.</p>
              ) : employers.length === 0 ? (
                <p className="text-sm text-ink-muted">No employers are waiting for verification.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {employers.slice(0, 5).map((employer) => (
                    <li key={employer._id || employer.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {employer.name || employer.companyName || "Company"}
                        </p>
                        <p className="truncate text-xs text-ink-muted">
                          {employer.owner?.email || employer.contactEmail || ""}
                        </p>
                      </div>
                      <span className="badge badge-warning shrink-0">Pending</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </Reveal>
      </div>
    </Page>
  );
}
