import { Link } from "react-router-dom";
import TiltCard from "../brand/TiltCard.jsx";
import Icon from "./Icon.jsx";
import { deadlineLabel, formatSalaryRange, initials, timeAgo, truncate } from "../../utils/format.js";
import { labelFor } from "../../utils/constants.js";

/**
 * Normalises the many shapes a job can arrive in.
 * The API nests the company and employer objects; both are flattened here.
 */
export function normalizeJob(job = {}) {
  const company = job.company && typeof job.company === "object" ? job.company : null;
  const employer = job.employer && typeof job.employer === "object" ? job.employer : null;
  return {
    id: job.id || job._id,
    title: job.title || job.jobTitle || "Untitled role",
    companyName: job.companyName || company?.name || employer?.name || "Confidential employer",
    companyId: company?.id || company?._id || job.companyId || null,
    logo: job.logo || job.logoUrl || job.companyLogo || company?.logoUrl || company?.logo || null,
    category: job.category || job.categoryName || null,
    location: job.location || job.district || "Sri Lanka",
    district: job.district || job.location || null,
    employmentType: labelFor("employmentType", job.employmentType),
    workMode: labelFor("workMode", job.workMode),
    experienceLevel: labelFor("experienceLevel", job.experienceLevel || job.experienceRequired),
    educationLevel: labelFor("educationLevel", job.educationLevel),
    salaryMin: job.salaryMin ?? job.salary_min ?? null,
    salaryMax: job.salaryMax ?? job.salary_max ?? null,
    skills: Array.isArray(job.skills) ? job.skills : job.skills ? String(job.skills).split(",").map((s) => s.trim()).filter(Boolean) : [],
    description: job.description || "",
    responsibilities: job.responsibilities || "",
    qualifications: job.qualifications || "",
    benefits: job.benefits || "",
    vacancies: job.vacancies ?? null,
    deadline: job.deadline || job.applicationDeadline || null,
    status: job.status || "approved",
    isFeatured: job.isFeatured === true,
    applicationsCount: job.applicationsCount ?? null,
    views: job.views ?? null,
    createdAt: job.createdAt || job.postedAt || job.created_at || null,
  };
}

/**
 * Job card — the workhorse of the browse experience.
 *
 * variant="card"  -> 3D tilted card used in the grid
 * variant="list"  -> wide horizontal row used in list view
 */
export function JobCard({ job, variant = "card", saved = false, onToggleSave, canSave = false, index = 0 }) {
  const j = normalizeJob(job);

  const meta = [
    j.employmentType,
    j.workMode,
    j.experienceLevel,
    j.educationLevel,
  ].filter(Boolean);

  const saveButton = canSave && onToggleSave ? (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggleSave(j);
      }}
      aria-label={saved ? `Remove ${j.title} from saved jobs` : `Save ${j.title}`}
      aria-pressed={saved}
      className={`btn btn-ghost !px-2 !py-2 transition-transform hover:scale-110 ${saved ? "text-aurora-600 dark:text-aurora-300" : "text-ink-muted"}`}
    >
      <Icon name="bookmark" size={18} filled={saved} />
    </button>
  ) : null;

  if (variant === "list") {
    return (
      <article className="surface card-glow hover:shadow-e4 group relative p-4 transition-shadow duration-300 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4 sm:w-64 sm:shrink-0">
            <CompanyMark logo={j.logo} name={j.companyName} />
            <div className="min-w-0">
              <Link
                to={`/jobs/${j.id}`}
                className="font-display text-base font-semibold text-ink transition-colors hover:text-aurora-600 dark:hover:text-aurora-300"
              >
                <span className="absolute inset-0" aria-hidden="true" />
                {j.title}
              </Link>
              <p className="mt-0.5 truncate text-sm text-ink-muted">{j.companyName}</p>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {j.category ? <span className="badge badge-accent">{j.category}</span> : null}
              {meta.map((item) => (
                <span key={item} className="badge">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-ink-2">{truncate(j.description, 180)}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="mapPin" size={13} /> {j.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="wallet" size={13} /> {formatSalaryRange(j.salaryMin, j.salaryMax)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="clock" size={13} /> {j.createdAt ? timeAgo(j.createdAt) : "Recently"}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
            {saveButton}
            <span className="badge badge-warning">{deadlineLabel(j.deadline)}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <TiltCard className="card-3d card-glow h-full p-5" max={7} data-index={index}>
      <div className="flex items-start justify-between gap-3">
        <CompanyMark logo={j.logo} name={j.companyName} />
        {saveButton}
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-ink">
        <Link to={`/jobs/${j.id}`} className="transition-colors after:absolute after:inset-0 hover:text-aurora-600 dark:hover:text-aurora-300">
          {j.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-ink-muted">{j.companyName}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {j.category ? <span className="badge badge-accent">{j.category}</span> : null}
        {j.employmentType ? <span className="badge">{j.employmentType}</span> : null}
        {j.workMode ? <span className="badge">{j.workMode}</span> : null}
      </div>

      <dl className="mt-4 space-y-1.5 text-sm text-ink-2">
        <div className="flex items-center gap-2">
          <Icon name="mapPin" size={15} className="text-ink-muted" />
          <dd>{j.location}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="wallet" size={15} className="text-ink-muted" />
          <dd className="font-semibold text-ink">{formatSalaryRange(j.salaryMin, j.salaryMax)}</dd>
        </div>
        {j.experienceLevel ? (
          <div className="flex items-center gap-2">
            <Icon name="award" size={15} className="text-ink-muted" />
            <dd>{j.experienceLevel}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="clock" size={13} /> {j.createdAt ? timeAgo(j.createdAt) : "Recently"}
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium text-warning">
          <Icon name="calendar" size={13} /> {deadlineLabel(j.deadline)}
        </span>
      </div>
    </TiltCard>
  );
}

/** Company logo with a graceful initials fallback. */
export function CompanyMark({ logo, name = "", size = "md" }) {
  const dims = size === "lg" ? "h-16 w-16 text-lg" : size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";
  if (logo) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        loading="lazy"
        className={`${dims} shrink-0 rounded-xl border border-line bg-surface object-contain p-1 shadow-e1`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${dims} flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-500 to-violet-glow font-display font-bold text-white shadow-e2`}
    >
      {initials(name)}
    </span>
  );
}

export default JobCard;
