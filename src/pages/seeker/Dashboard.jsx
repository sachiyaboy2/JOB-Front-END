import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import JobCard from "../../components/ui/JobCard.jsx";
import { Reveal } from "../../components/brand/useReveal.jsx";
import { Skeleton, TableSkeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiErrorMessage, applicationsApi, jobsApi, notificationsApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { formatDate, timeAgo } from "../../utils/format.js";

export default function SeekerDashboard() {
  useDocumentTitle("My dashboard");

  const { user } = useAuth();

  const applications = useFetch(() => applicationsApi.mine(), []);
  const saved = useFetch(() => jobsApi.saved(), []);
  const notifications = useFetch(() => notificationsApi.list(), []);

  const appList = toArray(applications.data);
  const savedList = toArray(saved.data);
  const noteList = toArray(notifications.data);

  const counts = {
    total: appList.length,
    active: appList.filter((a) => ["applied", "shortlisted", "interview"].includes(a.status)).length,
    shortlisted: appList.filter((a) => a.status === "shortlisted").length,
    saved: savedList.length,
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      toast.success("All notifications marked as read");
      notifications.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not update notifications."));
    }
  };

  const markRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      notifications.reload();
    } catch {
      /* leave the badge as it is */
    }
  };
  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Hello, {user?.name?.split(" ")[0] || "there"}
        </h1>
        <p className="mt-2 text-ink-muted">
          Track your applications, saved jobs and alerts in one place.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={counts.total} icon="fileText" tone="aurora" />
        <StatCard label="In progress" value={counts.active} icon="clock" tone="cyan" />
        <StatCard label="Shortlisted" value={counts.shortlisted} icon="star" tone="violet" />
        <StatCard label="Saved jobs" value={counts.saved} icon="bookmark" tone="success" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---- Applications ---- */}
        <section aria-labelledby="dash-applications" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="dash-applications" className="font-display text-xl font-semibold text-ink">
              Recent applications
            </h2>
            <Link to="/seeker/applications" className="btn btn-ghost">
              View all
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>

          <div className="mt-4">
            {applications.loading ? (
              <TableSkeleton rows={4} />
            ) : applications.error ? (
              <ErrorState
                title="We could not load your applications"
                message={apiErrorMessage(applications.error, "The applications service is not responding.")}
                onRetry={applications.reload}
              />
            ) : appList.length === 0 ? (
              <EmptyState
                icon="fileText"
                title="No applications yet"
                message="Find a role that fits and send your first application."
                action={
                  <Link to="/jobs" className="btn btn-primary">
                    Browse jobs
                  </Link>
                }
              />
            ) : (
              <div className="table-shell overflow-x-auto">
                <table>
                  <caption className="sr-only">Your recent job applications</caption>
                  <thead>
                    <tr>
                      <th scope="col">Role</th>
                      <th scope="col">Applied</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appList.slice(0, 6).map((application) => {
                      const job = application.job || {};
                      const title = job.title || application.jobTitle || "Application";
                      const company = job.company?.name || application.companyName || "Employer";
                      return (
                        <tr key={application.id || application._id}>
                          <td>
                            <Link
                              to={`/jobs/${job.id || job._id || application.jobId}`}
                              className="font-medium text-ink hover:text-aurora-600 dark:hover:text-aurora-300"
                            >
                              {title}
                            </Link>
                            <span className="block text-xs text-ink-muted">{company}</span>
                          </td>
                          <td className="whitespace-nowrap text-ink-muted">
                            {formatDate(application.createdAt || application.appliedAt)}
                          </td>
                          <td>
                            <StatusBadge status={application.status} size="sm" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ---- Saved jobs ---- */}
          <div className="mt-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-ink">Saved jobs</h2>
              <Link to="/seeker/saved-jobs" className="btn btn-ghost">
                View all
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>

            <div className="mt-4">
              {saved.loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton key={index} className="h-40 w-full rounded-lg" />
                  ))}
                </div>
              ) : saved.error ? (
                <ErrorState
                  compact
                  title="Saved jobs are unavailable"
                  message={apiErrorMessage(saved.error, "We could not reach the saved jobs service.")}
                  onRetry={saved.reload}
                />
              ) : savedList.length === 0 ? (
                <EmptyState
                  icon="bookmark"
                  title="Nothing saved yet"
                  message="Tap the bookmark on any job to keep it here."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {savedList.slice(0, 2).map((job, index) => (
                    <JobCard key={job._id || job.id || index} job={job} index={index} saved />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ---- Sidebar ---- */}
        <aside className="space-y-5">
          <div className="card-glow surface p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-500 to-violet-glow font-display text-lg font-bold text-white shadow-e2">
                {(user?.name || "U").slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-ink">{user?.name}</p>
                <p className="truncate text-xs text-ink-muted">{user?.email}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-2.5 text-sm">
              {[
                ["Phone", user?.phone],
                ["District", user?.district || user?.location],
                ["Experience", user?.experience],
                ["Expected salary", user?.expectedSalary ? `LKR ${user.expectedSalary}` : null],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <dt className="text-ink-muted">{label}</dt>
                    <dd className="truncate font-medium text-ink">{value}</dd>
                  </div>
                ))}
            </dl>
            <Link to="/seeker/profile" className="btn btn-secondary mt-5 w-full">
              <Icon name="pencil" size={15} />
              Complete your profile
            </Link>
          </div>

          <section aria-labelledby="dash-notifications" className="surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 id="dash-notifications" className="font-display text-base font-semibold text-ink">
                Notifications
              </h2>
              {noteList.length ? (
                <button type="button" onClick={markAllRead} className="btn btn-ghost !px-2 !py-1 text-xs">
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="mt-4">
              {notifications.loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : notifications.error ? (
                <p className="text-sm text-ink-muted">Notifications are unavailable right now.</p>
              ) : noteList.length === 0 ? (
                <p className="text-sm text-ink-muted">You have no notifications yet.</p>
              ) : (
                <ul className="space-y-2.5">
                  {noteList.slice(0, 6).map((note) => (
                    <li key={note._id || note.id}>
                      <button
                        type="button"
                        onClick={() => markRead(note.id || note._id)}
                        className={`w-full rounded-md border p-3 text-left transition-colors ${
                          note.read
                            ? "border-line bg-surface-2/50"
                            : "border-aurora-500/40 bg-aurora-500/6"
                        }`}
                      >
                        <span className="block text-sm font-medium text-ink">{note.title || "Notification"}</span>
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {note.body ? note.body : timeAgo(note.createdAt)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </aside>
      </div>
    </Page>
  );
}
