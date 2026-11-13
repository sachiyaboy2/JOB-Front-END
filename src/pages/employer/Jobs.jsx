import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { TableSkeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { apiErrorMessage, jobsApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { formatDate } from "../../utils/format.js";

const FILTERS = ["all", "pending", "approved", "draft", "rejected", "closed"];

export default function EmployerJobs() {
  useDocumentTitle("My jobs");

  const [filter, setFilter] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const { data, loading, error, reload } = useFetch(() => jobsApi.mine(), []);
  const all = toArray(data);
  const jobs = filter === "all" ? all : all.filter((job) => job.status === filter);

  const updateStatus = async (job, status, message) => {
    const id = job.id || job._id;
    setBusyId(String(id));
    try {
      await jobsApi.update(id, { status });
      toast.success(message);
      reload();
    } catch (err) {
      // The API only accepts "draft" and "pending" as a new status from the
      // edit form, so a rejected "closed" falls back to pausing the advert.
      if (status === "closed" && err?.response?.status === 422) {
        try {
          await jobsApi.update(id, { status: "draft" });
          toast.success("Advert closed — it is now paused as a draft.");
          reload();
        } catch (fallbackError) {
          toast.error(apiErrorMessage(fallbackError, "The job could not be closed."));
        }
      } else {
        toast.error(apiErrorMessage(err, "The job could not be updated."));
      }
    } finally {
      setBusyId(null);
    }
  };

  const remove = async () => {
    const id = pendingDelete?.id || pendingDelete?._id;
    try {
      await jobsApi.remove(id);
      toast.success("Job deleted");
      setPendingDelete(null);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The job could not be deleted."));
    }
  };

  return (
    <Page>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">My jobs</h1>
          <p className="mt-2 text-ink-muted">Manage every advert you have published.</p>
        </div>
        <Link to="/employer/jobs/new" className="btn btn-primary">
          <Icon name="plus" size={16} />
          Post a job
        </Link>
      </header>

      <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((item) => {
          const count = item === "all" ? all.length : all.filter((job) => job.status === item).length;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === item ? "bg-aurora-500 text-white shadow-e1" : "bg-surface-2 text-ink-2 hover:bg-line"
              }`}
            >
              {item === "all" ? "All" : item} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <ErrorState
          title="We could not load your jobs"
          message={apiErrorMessage(error, "The jobs service is not responding.")}
          onRetry={reload}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="briefcase"
          title={filter === "all" ? "You have not posted a job yet" : `No ${filter} jobs`}
          message={
            filter === "all"
              ? "Publish your first vacancy and start receiving applications."
              : "Try a different status filter."
          }
          action={
            filter === "all" ? (
              <Link to="/employer/jobs/new" className="btn btn-primary">
                Post a job
              </Link>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={() => setFilter("all")}>
                Show all
              </button>
            )
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
                <th scope="col">Deadline</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const id = job.id || job._id;
                const busy = busyId === String(id);
                const canPause = ["approved", "pending"].includes(job.status);
                const canClose = job.status !== "closed";
                return (
                  <tr key={id}>
                    <td>
                      <span className="font-medium text-ink">{job.title}</span>
                      <span className="block text-xs text-ink-muted">
                        {job.location}
                        {job.district ? ` · ${job.district}` : ""} ·{" "}
                        {job.employmentType ? job.employmentType : "full-time"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-ink-muted">{formatDate(job.createdAt)}</td>
                    <td className="whitespace-nowrap text-ink-muted">{formatDate(job.deadline)}</td>
                    <td>
                      <StatusBadge status={job.status} size="sm" />
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <Link
                          to={`/employer/jobs/${id}/edit`}
                          className="btn btn-ghost !px-2 !py-1.5"
                          aria-label={`Edit ${job.title}`}
                        >
                          <Icon name="pencil" size={15} />
                        </Link>

                        {canPause ? (
                          <button
                            type="button"
                            className="btn btn-ghost !px-2 !py-1.5"
                            onClick={() => updateStatus(job, "paused", "Job paused")}
                            disabled={busy}
                            aria-label={`Pause ${job.title}`}
                          >
                            <Icon name="pauseCircle" size={15} />
                          </button>
                        ) : null}

                        {canClose ? (
                          <button
                            type="button"
                            className="btn btn-ghost !px-2 !py-1.5"
                            onClick={() => updateStatus(job, "closed", "Job closed")}
                            disabled={busy}
                            aria-label={`Close ${job.title}`}
                          >
                            <Icon name="ban" size={15} />
                          </button>
                        ) : null}

                        <button
                          type="button"
                          className="btn btn-ghost !px-2 !py-1.5 text-danger"
                          onClick={() => setPendingDelete(job)}
                          aria-label={`Delete ${job.title}`}
                        >
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this job?"
        message="The advert and its applications are removed. This cannot be undone."
        confirmLabel="Delete job"
        danger
        onConfirm={remove}
        onClose={() => setPendingDelete(null)}
      />
    </Page>
  );
}
