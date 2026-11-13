import { useState } from "react";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import Modal from "../../components/ui/Modal.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { apiErrorMessage, adminApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { formatDate } from "../../utils/format.js";

export default function AdminApprovals() {
  useDocumentTitle("Approvals");

  const [rejectTarget, setRejectTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState(null);

  const pendingJobs = useFetch(() => adminApi.pendingJobs(), []);
  const pendingEmployers = useFetch(() => adminApi.pendingEmployers(), []);

  const jobs = toArray(pendingJobs.data);
  const employers = toArray(pendingEmployers.data);

  const approveJob = async (job) => {
    const id = job._id || job.id;
    setBusyId(String(id));
    try {
      await adminApi.approveJob(id);
      toast.success("Job advert approved and published");
      pendingJobs.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The advert could not be approved."));
    } finally {
      setBusyId(null);
    }
  };

  const rejectJob = async () => {
    const id = rejectTarget?._id || rejectTarget?.id;
    try {
      await adminApi.rejectJob(id, reason.trim() || "Does not meet the listing guidelines.");
      toast.success("Job advert rejected");
      setRejectTarget(null);
      setReason("");
      pendingJobs.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The advert could not be rejected."));
    }
  };

  const verifyEmployer = async (employer, payload) => {
    // Pending employers arrive as company records; the verification route
    // expects the id of the employer user who owns the company.
    const id = employer.owner?.id || employer.owner?._id;
    if (!id) {
      toast.error("This company has no linked employer account to verify.");
      return;
    }
    setBusyId(String(id));
    try {
      await adminApi.verifyEmployer(id, { verified: Boolean(payload.verified) });
      toast.success(payload.verified ? "Employer verified" : "Employer verification removed");
      pendingEmployers.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The employer could not be updated."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Approvals</h1>
        <p className="mt-2 text-ink-muted">
          Review job adverts and employer registrations before they go live.
        </p>
      </header>

      <section aria-labelledby="pending-job-adverts">
        <h2 id="pending-job-adverts" className="font-display text-xl font-semibold text-ink">
          Pending job adverts
          <span className="ml-2 badge badge-warning">{jobs.length}</span>
        </h2>

        <div className="mt-4">
          {pendingJobs.loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          ) : pendingJobs.error ? (
            <ErrorState
              title="We could not load pending adverts"
              message={apiErrorMessage(pendingJobs.error, "The admin service is not responding.")}
              onRetry={pendingJobs.reload}
            />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon="checkCircle"
              title="No adverts waiting"
              message="Every submitted advert has been reviewed. New submissions appear here."
            />
          ) : (
            <ul className="space-y-3">
              {jobs.map((job) => {
                const id = job._id || job.id;
                return (
                  <li key={id} className="surface p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-lg font-semibold text-ink">{job.title}</h3>
                        <p className="mt-1 text-sm text-ink-muted">
                          {job.companyName || job.company?.name || "Employer"} · {job.location || "Sri Lanka"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {job.category ? <span className="badge badge-accent">{job.category}</span> : null}
                          {job.employmentType ? <span className="badge">{job.employmentType}</span> : null}
                          {job.workMode ? <span className="badge">{job.workMode}</span> : null}
                        </div>
                        <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-ink-2">{job.description}</p>
                        <p className="mt-2 text-xs text-ink-muted">Submitted {formatDate(job.createdAt)}</p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => setRejectTarget(job)}
                          disabled={busyId === String(id)}
                        >
                          <Icon name="xCircle" size={15} />
                          Reject
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => approveJob(job)}
                          disabled={busyId === String(id)}
                        >
                          {busyId === String(id) ? (
                            <Icon name="loader" size={15} className="animate-spin" />
                          ) : (
                            <Icon name="check" size={15} />
                          )}
                          Approve
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="pending-employers" className="mt-12">
        <h2 id="pending-employers" className="font-display text-xl font-semibold text-ink">
          Pending employers
          <span className="ml-2 badge badge-warning">{employers.length}</span>
        </h2>

        <div className="mt-4">
          {pendingEmployers.loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : pendingEmployers.error ? (
            <ErrorState
              title="We could not load pending employers"
              message={apiErrorMessage(pendingEmployers.error, "The admin service is not responding.")}
              onRetry={pendingEmployers.reload}
            />
          ) : employers.length === 0 ? (
            <EmptyState
              icon="shield"
              title="No employers waiting"
              message="New employer registrations appear here for verification."
            />
          ) : (
            <ul className="space-y-3">
              {employers.map((employer) => {
                const owner = employer.owner || {};
                const id = owner.id || owner._id || employer.id || employer._id;
                return (
                  <li key={id} className="surface flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-semibold text-ink">
                        {employer.name || employer.companyName || "Company"}
                      </h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {owner.email || employer.contactEmail || ""}{" "}
                        {owner.name ? `· ${owner.name}` : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <StatusBadge status="pending" size="sm" />
                        {employer.industry ? <span className="badge">{employer.industry}</span> : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => verifyEmployer(employer, { verified: false })}
                        disabled={busyId === String(id)}
                      >
                        <Icon name="ban" size={15} />
                        Decline
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => verifyEmployer(employer, { verified: true })}
                        disabled={busyId === String(id)}
                      >
                        {busyId === String(id) ? (
                          <Icon name="loader" size={15} className="animate-spin" />
                        ) : (
                          <Icon name="shield" size={15} />
                        )}
                        Verify
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject this advert"
        description={rejectTarget?.title}
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setRejectTarget(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={rejectJob}>
              <Icon name="xCircle" size={15} />
              Reject advert
            </button>
          </>
        }
      >
        <label htmlFor="reject-reason" className="label">
          Reason (shown to the employer)
        </label>
        <textarea
          id="reject-reason"
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Please describe what needs to change before this advert can be published."
          className="field resize-y"
        />
      </Modal>
    </Page>
  );
}
