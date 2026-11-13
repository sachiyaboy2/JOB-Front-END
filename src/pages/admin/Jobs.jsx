import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { TableSkeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { apiErrorMessage, adminApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDebounce, useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { formatDate } from "../../utils/format.js";

const STATUS_FILTERS = ["all", "approved", "pending", "draft", "rejected", "closed", "taken_down"];

export default function AdminJobs() {
  useDocumentTitle("All jobs");

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [pendingTakeDown, setPendingTakeDown] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const debounced = useDebounce(keyword, 400);
  const query = useMemo(
    () => ({ q: debounced, ...(status !== "all" ? { status } : {}), limit: 50 }),
    [debounced, status],
  );

  const { data, loading, error, reload } = useFetch(() => adminApi.jobs(query), [query]);
  const jobs = toArray(data);

  const takeDown = async () => {
    const id = pendingTakeDown?._id || pendingTakeDown?.id;
    try {
      await adminApi.takeDownJob(id);
      toast.success("Advert taken down");
      setPendingTakeDown(null);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The advert could not be taken down."));
    }
  };

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">All jobs</h1>
        <p className="mt-2 text-ink-muted">Search, filter and moderate every advert on the platform.</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="admin-jobs-search" className="sr-only">
            Search jobs
          </label>
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
            <Icon name="search" size={17} />
          </span>
          <input
            id="admin-jobs-search"
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search by title, company or location"
            className="field !pl-10"
          />
        </div>
        <div>
          <label htmlFor="admin-jobs-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="admin-jobs-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="field !w-auto"
          >
            {STATUS_FILTERS.map((item) => (
              <option key={item} value={item} className="capitalize">
                {item === "all" ? "All statuses" : item.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : error ? (
          <ErrorState
            title="We could not load the job list"
            message={apiErrorMessage(error, "The admin service is not responding.")}
            onRetry={reload}
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title="No jobs match that search"
            message="Try a different keyword or status filter."
          />
        ) : (
          <div className="table-shell overflow-x-auto">
            <table>
              <caption className="sr-only">All job adverts on the platform</caption>
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Company</th>
                  <th scope="col">Posted</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const id = job._id || job.id;
                  return (
                    <tr key={id}>
                      <td>
                        <Link
                          to={`/jobs/${id}`}
                          className="font-medium text-ink hover:text-aurora-600 dark:hover:text-aurora-300"
                        >
                          {job.title}
                        </Link>
                        <span className="block text-xs text-ink-muted">{job.location}</span>
                      </td>
                      <td className="text-ink-muted">{job.companyName || job.company?.name || "—"}</td>
                      <td className="whitespace-nowrap text-ink-muted">{formatDate(job.createdAt)}</td>
                      <td>
                        <StatusBadge status={job.status} size="sm" />
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-danger !px-2.5 !py-1.5 text-xs"
                          onClick={() => setPendingTakeDown(job)}
                          disabled={busyId === String(id)}
                        >
                          <Icon name="ban" size={14} />
                          Take down
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingTakeDown)}
        title="Take this advert down?"
        message="It is hidden from the portal immediately and the employer is notified."
        confirmLabel="Take down"
        danger
        onConfirm={takeDown}
        onClose={() => setPendingTakeDown(null)}
      />
    </Page>
  );
}
