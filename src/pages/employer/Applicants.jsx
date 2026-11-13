import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { Skeleton, TableSkeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { apiErrorMessage, applicationsApi, cvApi, jobsApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { formatDate } from "../../utils/format.js";

const NEXT_STATUSES = [
  { value: "shortlisted", label: "Shortlist", icon: "star", className: "btn-secondary" },
  { value: "interview", label: "Interview", icon: "calendar", className: "btn-secondary" },
  { value: "hired", label: "Hire", icon: "award", className: "btn-primary" },
  { value: "rejected", label: "Reject", icon: "xCircle", className: "btn-danger" },
];

export default function EmployerApplicants() {
  useDocumentTitle("Applicants");

  const [jobId, setJobId] = useState("");

  const jobs = useFetch(() => jobsApi.mine(), []);
  const jobList = useArray(jobs.data);

  // Default to the first live job.
  useEffect(() => {
    if (jobId || jobList.length === 0) return;
    const live = jobList.find((job) => ["approved", "pending"].includes(job.status)) || jobList[0];
    setJobId(String(live.id || live._id));
  }, [jobList, jobId]);

  const applications = useFetch(() => (jobId ? applicationsApi.forJob(jobId) : Promise.resolve([])), [jobId]);
  const list = useArray(applications.data);

  const counts = useMemo(
    () => ({
      total: list.length,
      shortlisted: list.filter((a) => a.status === "shortlisted").length,
      interview: list.filter((a) => a.status === "interview").length,
      hired: list.filter((a) => a.status === "hired").length,
    }),
    [list],
  );

  const changeStatus = async (application, status) => {
    const id = application.id || application._id;
    try {
      await applicationsApi.updateStatus(id, status);
      toast.success(`Application marked as ${status}`);
      applications.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The application could not be updated."));
    }
  };

  const openCv = async (application) => {
    const cv = application.cv;
    const candidate = application.seeker || application.user || {};
    const fileName = application.cvFileName || candidate.name || "CV";
    if (!cv) {
      toast("No CV is attached to this application.", { icon: "📄" });
      return;
    }
    try {
      await cvApi.download(cv, fileName);
    } catch (err) {
      toast.error(apiErrorMessage(err, "The CV could not be opened."));
    }
  };

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Applicants</h1>
        <p className="mt-2 text-ink-muted">Review who applied, view their CV and move them through the process.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Applications", value: counts.total, icon: "users" },
          { label: "Shortlisted", value: counts.shortlisted, icon: "star" },
          { label: "Interviews", value: counts.interview, icon: "calendar" },
          { label: "Hired", value: counts.hired, icon: "award" },
        ].map((stat) => (
          <div key={stat.label} className="surface p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{stat.label}</p>
                <p className="mt-1.5 font-display text-2xl font-bold text-ink">{stat.value}</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                <Icon name={stat.icon} size={18} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <label htmlFor="applicant-job" className="label">
          Select a role
        </label>
        {jobs.loading ? (
          <Skeleton className="h-11 w-full max-w-md" />
        ) : jobs.error ? (
          <ErrorState
            compact
            title="We could not load your jobs"
            message={apiErrorMessage(jobs.error, "The jobs service is not responding.")}
            onRetry={jobs.reload}
          />
        ) : jobList.length === 0 ? (
          <EmptyState
            icon="briefcase"
            title="Post a job first"
            message="Applicants appear here once you have a live role."
          />
        ) : (
          <select
            id="applicant-job"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
            className="field max-w-md"
          >
            {jobList.map((job) => (
              <option key={job._id || job.id} value={job._id || job.id}>
                {job.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-6">
        {!jobId ? null : applications.loading ? (
          <TableSkeleton rows={5} />
        ) : applications.error ? (
          <ErrorState
            title="We could not load the applicants"
            message={apiErrorMessage(applications.error, "The applications service is not responding.")}
            onRetry={applications.reload}
          />
        ) : list.length === 0 ? (
          <EmptyState
            icon="users"
            title="No applicants for this role yet"
            message="Share the job link or wait for applicants to come in."
          />
        ) : (
          <div className="table-shell overflow-x-auto">
            <table>
              <caption className="sr-only">Applicants for the selected role</caption>
              <thead>
                <tr>
                  <th scope="col">Candidate</th>
                  <th scope="col">Applied</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.map((application) => {
                  const candidate = application.seeker || application.user || {};
                  const name = candidate.name || application.applicantName || "Candidate";
                  const email = candidate.email || application.applicantEmail || "—";
                  return (
                    <tr key={application.id || application._id}>
                      <td>
                        <span className="font-medium text-ink">{name}</span>
                        <span className="block text-xs text-ink-muted">{email}</span>
                      </td>
                      <td className="whitespace-nowrap text-ink-muted">
                        {formatDate(application.createdAt || application.appliedAt)}
                      </td>
                      <td>
                        <StatusBadge status={application.status} size="sm" />
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          <button
                            type="button"
                            className="btn btn-ghost !px-2 !py-1.5"
                            onClick={() => openCv(application)}
                            aria-label={`View CV of ${name}`}
                          >
                            <Icon name="fileText" size={15} />
                          </button>
                          {NEXT_STATUSES.map((status) => {
                            if (application.status === status.value) return null;
                            return (
                              <button
                                key={status.value}
                                type="button"
                                className={`btn ${status.className} !px-2.5 !py-1.5 text-xs`}
                                onClick={() => changeStatus(application, status.value)}
                                aria-label={`${status.label} ${name}`}
                              >
                                <Icon name={status.icon} size={14} />
                                <span className="hidden lg:inline">{status.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Page>
  );
}

/** Small helper so both fetch results normalise to an array. */
function useArray(payload) {
  return useMemo(() => toArray(payload), [payload]);
}
