import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import Modal from "../../components/ui/Modal.jsx";
import { CompanyMark, normalizeJob } from "../../components/ui/JobCard.jsx";
import { SkeletonBlock, Skeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiErrorMessage, applicationsApi, cvApi, jobsApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { deadlineLabel, formatDate, formatSalaryRange } from "../../utils/format.js";

export default function JobDetail() {
  const { id } = useParams();
  const { isAuthenticated, role, isSeeker } = useAuth();

  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvId, setCvId] = useState("");
  const [cvs, setCvs] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, error, reload } = useFetch(() => jobsApi.get(id), [id]);
  const job = normalizeJob(data?.job || data?.data || data || {});

  useDocumentTitle(job?.title || "Job");

  useEffect(() => {
    if (!applyOpen || !isSeeker) return;
    cvApi
      .mine()
      .then((payload) => {
        const list = toArray(payload);
        setCvs(list);
        if (list.length && !cvId) setCvId(String(list[0]._id || list[0].id));
      })
      .catch(() => setCvs([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyOpen, isSeeker]);

  const submitApplication = async () => {
    setSubmitting(true);
    try {
      await applicationsApi.create({
        jobId: id,
        coverLetter: coverLetter.trim() || undefined,
        cvId: cvId || undefined,
      });
      toast.success("Application sent — good luck!");
      setApplyOpen(false);
      setCoverLetter("");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not send your application."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="surface p-6">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="mt-4 h-4 w-1/3" />
            <SkeletonBlock className="mt-8" lines={7} />
          </div>
          <div className="surface h-64 p-6">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <ErrorState
          title="We could not load this job"
          message={apiErrorMessage(error, "The job posting may have been removed.")}
          onRetry={reload}
        />
      </Page>
    );
  }

  const requirements = [
    job.experienceLevel && { label: "Experience", value: job.experienceLevel },
    job.educationLevel && { label: "Education", value: job.educationLevel },
    job.employmentType && { label: "Employment type", value: job.employmentType },
    job.workMode && { label: "Work mode", value: job.workMode },
    job.vacancies && { label: "Vacancies", value: String(job.vacancies) },
  ].filter(Boolean);

  return (
    <Page>
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex items-center gap-1.5 text-xs text-ink-muted">
          <li>
            <Link to="/" className="hover:text-ink hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevronRight" size={12} />
          </li>
          <li>
            <Link to="/jobs" className="hover:text-ink hover:underline">
              Jobs
            </Link>
          </li>
          <li aria-hidden="true">
            <Icon name="chevronRight" size={12} />
          </li>
          <li aria-current="page" className="truncate text-ink-2">
            {job.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ---- Main column ---- */}
        <article className="min-w-0">
          <div className="card-glow surface p-6 sm:p-8">
            <div className="flex flex-wrap items-start gap-4">
              <CompanyMark logo={job.logo} name={job.companyName} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">{job.title}</h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
                  <span className="font-medium text-ink-2">{job.companyName}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="mapPin" size={14} />
                    {job.location}
                  </span>
                </p>
              </div>
              {job.category ? <span className="badge badge-accent">{job.category}</span> : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {job.employmentType ? <span className="badge">{job.employmentType}</span> : null}
              {job.workMode ? <span className="badge">{job.workMode}</span> : null}
              {job.experienceLevel ? <span className="badge">{job.experienceLevel}</span> : null}
              {job.educationLevel ? <span className="badge">{job.educationLevel}</span> : null}
            </div>
          </div>

          {job.description ? (
            <section aria-labelledby="about-heading" className="surface mt-6 p-6 sm:p-8">
              <h2 id="about-heading" className="font-display text-xl font-semibold text-ink">
                About this role
              </h2>
              <div className="mt-3 space-y-3 text-pretty leading-relaxed text-ink-2">
                {String(job.description)
                  .split(/\n{2,}/)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            </section>
          ) : null}

          {requirements.length ? (
            <section aria-labelledby="requirements-heading" className="surface mt-6 p-6 sm:p-8">
              <h2 id="requirements-heading" className="font-display text-xl font-semibold text-ink">
                Requirements
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {requirements.map((item) => (
                  <div key={item.label} className="rounded-lg border border-line bg-surface-2/60 p-4">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{item.label}</dt>
                    <dd className="mt-1 font-medium text-ink">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {job.skills.length ? (
            <section aria-labelledby="skills-heading" className="surface mt-6 p-6 sm:p-8">
              <h2 id="skills-heading" className="font-display text-xl font-semibold text-ink">
                Skills
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <li key={skill} className="badge badge-accent">
                    {skill}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>

        {/* ---- Sidebar ---- */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card-glow surface p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Salary range</p>
            <p className="mt-1.5 font-display text-2xl font-bold text-ink">
              {formatSalaryRange(job.salaryMin, job.salaryMax)}
            </p>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="inline-flex items-center gap-2 text-ink-muted">
                  <Icon name="mapPin" size={15} /> Location
                </dt>
                <dd className="text-right font-medium text-ink">{job.location}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="inline-flex items-center gap-2 text-ink-muted">
                  <Icon name="calendar" size={15} /> Deadline
                </dt>
                <dd className="text-right font-medium text-ink">
                  {formatDate(job.deadline)}
                  <span className="block text-xs font-normal text-warning">{deadlineLabel(job.deadline)}</span>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="inline-flex items-center gap-2 text-ink-muted">
                  <Icon name="clock" size={15} /> Posted
                </dt>
                <dd className="text-right font-medium text-ink">{formatDate(job.createdAt)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" state={{ from: `/jobs/${id}` }} className="btn btn-primary w-full">
                    Sign in to apply
                    <Icon name="arrowRight" size={16} />
                  </Link>
                  <p className="mt-2 text-center text-xs text-ink-muted">
                    New here?{" "}
                    <Link to="/register" className="font-semibold text-aurora-600 hover:underline dark:text-aurora-300">
                      Create a free account
                    </Link>
                  </p>
                </>
              ) : isSeeker ? (
                <>
                  <button type="button" className="btn btn-primary w-full" onClick={() => setApplyOpen(true)}>
                    <Icon name="send" size={16} />
                    Apply now
                  </button>
                  <p className="mt-2 text-center text-xs text-ink-muted">Your CV and profile are sent with the application.</p>
                </>
              ) : (
                <div className="rounded-lg border border-line bg-surface-2 p-4 text-sm text-ink-muted">
                  You are signed in as {role}. Only job seekers can apply to a role.
                </div>
              )}
            </div>
          </div>

          <div className="surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">Company</h2>
            <div className="mt-4 flex items-center gap-3">
              <CompanyMark logo={job.logo} name={job.companyName} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{job.companyName}</p>
                <p className="truncate text-xs text-ink-muted">{job.location}</p>
              </div>
            </div>
            {job.companyId ? (
              <Link
                to={`/companies/${job.companyId}`}
                className="btn btn-secondary mt-4 w-full"
              >
                View company
                <Icon name="arrowRight" size={16} />
              </Link>
            ) : null}
          </div>
        </aside>
      </div>

      {/* ---- Apply modal ---- */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="Apply for this role"
        description={job.title}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setApplyOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={submitApplication}
              disabled={submitting}
            >
              {submitting ? <Icon name="loader" size={15} className="animate-spin" /> : <Icon name="send" size={15} />}
              Send application
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="apply-cv" className="label">
              Attach a CV
            </label>
            {cvs.length ? (
              <select id="apply-cv" value={cvId} onChange={(event) => setCvId(event.target.value)} className="field">
                {cvs.map((cv) => (
                  <option key={cv._id || cv.id} value={cv._id || cv.id}>
                    {cv.fileName || cv.originalName || cv.name || "Uploaded CV"}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded-md border border-dashed border-line-strong p-4 text-sm text-ink-muted">
                You have not uploaded a CV yet.{" "}
                <Link to="/seeker/cv" className="font-semibold text-aurora-600 hover:underline dark:text-aurora-300">
                  Upload one
                </Link>{" "}
                so employers can review it.
              </div>
            )}
          </div>

          <div>
            <label htmlFor="apply-letter" className="label">
              Cover letter <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="apply-letter"
              rows={6}
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Tell the employer why you are a great fit for this role."
              className="field resize-y"
            />
          </div>
        </div>
      </Modal>
    </Page>
  );
}
