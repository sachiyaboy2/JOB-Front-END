import Icon from "./Icon.jsx";

/**
 * Status pill for jobs, applications, employers and users.
 * Every state has a colour and an icon so it never relies on colour alone.
 */
const MAP = {
  /* jobs */
  draft: { className: "badge", icon: "fileText", label: "Draft" },
  pending: { className: "badge badge-warning", icon: "clock", label: "Pending" },
  approved: { className: "badge badge-success", icon: "checkCircle", label: "Approved" },
  rejected: { className: "badge badge-danger", icon: "xCircle", label: "Rejected" },
  closed: { className: "badge", icon: "ban", label: "Closed" },
  taken_down: { className: "badge badge-danger", icon: "ban", label: "Taken down" },
  paused: { className: "badge badge-warning", icon: "pauseCircle", label: "Paused" },
  active: { className: "badge badge-success", icon: "checkCircle", label: "Active" },

  /* applications */
  applied: { className: "badge badge-warning", icon: "clock", label: "Applied" },
  shortlisted: { className: "badge badge-accent", icon: "star", label: "Shortlisted" },
  interview: { className: "badge badge-info", icon: "calendar", label: "Interview" },
  hired: { className: "badge badge-success", icon: "award", label: "Hired" },
  withdrawn: { className: "badge", icon: "arrowLeft", label: "Withdrawn" },

  /* employers / users */
  verified: { className: "badge badge-success", icon: "shield", label: "Verified" },
  suspended: { className: "badge badge-danger", icon: "ban", label: "Suspended" },
  inactive: { className: "badge", icon: "pauseCircle", label: "Inactive" },

  /* generic */
  approved_job: { className: "badge badge-success", icon: "checkCircle", label: "Approved" },
};

const ALIASES = {
  under_review: "pending",
  review: "pending",
  interview_scheduled: "interview",
  offered: "interview",
  accepted: "hired",
  takenDown: "taken_down",
  deleted: "withdrawn",
};

export function StatusBadge({ status, label, className = "", size = "md" }) {
  const key = String(status || "").toLowerCase();
  const config = MAP[key] || MAP[ALIASES[key]] || { className: "badge", icon: "info", label: label || key || "—" };

  return (
    <span
      className={`${config.className} ${size === "sm" ? "!px-2 !py-0.5 !text-[11px]" : ""} ${className}`}
    >
      <Icon name={config.icon} size={size === "sm" ? 12 : 13} />
      {label || config.label}
    </span>
  );
}

export default StatusBadge;
