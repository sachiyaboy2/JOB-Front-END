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
import { apiErrorMessage, applicationsApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { formatDate } from "../../utils/format.js";

const FILTERS = [
  { value: "", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

export default function SeekerApplications() {
  useDocumentTitle("My applications");

  const [filter, setFilter] = useState("");
  const [pendingWithdraw, setPendingWithdraw] = useState(null);

  const { data, loading, error, reload } = useFetch(() => applicationsApi.mine(), []);
  const all = toArray(data);
  const applications = filter ? all.filter((a) => a.status === filter) : all;

  const withdraw = async () => {
    const id = pendingWithdraw?.id || pendingWithdraw?._id;
    try {
      await applicationsApi.withdraw(id);
      toast.success("Application withdrawn");
      setPendingWithdraw(null);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The application could not be withdrawn."));
    }
  };

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">My applications</h1>
        <p className="mt-2 text-ink-muted">
          Every role you have applied for, with the latest status from the employer.
        </p>
      </header>

      <div className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.value || "all"}
            type="button"
            onClick={() => setFilter(item.value)}
            aria-pressed={filter === item.value}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === item.value
                ? "bg-aurora-500 text-white shadow-e1"
                : "bg-surface-2 text-ink-2 hover:bg-line"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <ErrorState
          title="We could not load your applications"
          message={apiErrorMessage(error, "The applications service is not responding.")}
          onRetry={reload}
        />
      ) : applications.length === 0 ? (
        <EmptyState
          icon="fileText"
          title={filter ? "No applications with that status" : "No applications yet"}
          message={
            filter
              ? "Try a different status filter."
              : "Find a role that fits and send your first application."
          }
          action={
            filter ? (
              <button type="button" className="btn btn-secondary" onClick={() => setFilter("")}>
                Show all
              </button>
            ) : (
              <Link to="/jobs" className="btn btn-primary">
                Browse jobs
              </Link>
            )
          }
        />
      ) : (
        <div className="table-shell overflow-x-auto">
          <table>
            <caption className="sr-only">Your job applications</caption>
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Company</th>
                <th scope="col">Applied</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => {
                const job = application.job || {};
                const jobId = job.id || job._id || application.jobId;
                const title = job.title || application.jobTitle || "Role";
                const company = job.company?.name || application.companyName || "Employer";
                const canWithdraw = !["hired", "rejected", "withdrawn"].includes(application.status);
                return (
                  <tr key={application.id || application._id}>
                    <td>
                      <Link
                        to={`/jobs/${jobId}`}
                        className="font-medium text-ink hover:text-aurora-600 dark:hover:text-aurora-300"
                      >
                        {title}
                      </Link>
                    </td>
                    <td className="text-ink-muted">{company}</td>
                    <td className="whitespace-nowrap text-ink-muted">
                      {formatDate(application.createdAt || application.appliedAt)}
                    </td>
                    <td>
                      <StatusBadge status={application.status} size="sm" />
                    </td>
                    <td className="text-right">
                      {canWithdraw ? (
                        <button
                          type="button"
                          className="btn btn-ghost !px-2.5 !py-1.5 text-xs text-danger"
                          onClick={() => setPendingWithdraw(application)}
                          aria-label={`Withdraw application for ${title}`}
                        >
                          <Icon name="x" size={14} />
                          Withdraw
                        </button>
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingWithdraw)}
        title="Withdraw this application?"
        message="The employer will no longer see this application. You can apply again later if the role is still open."
        confirmLabel="Withdraw"
        danger
        onConfirm={withdraw}
        onClose={() => setPendingWithdraw(null)}
      />
    </Page>
  );
}
