/**
 * Reference values that mirror the API contract.
 *
 * The option lists carry the exact value the API expects plus the label the
 * user reads, so no page has to translate between "full-time" and "Full-time".
 */

export const FALLBACK_CATEGORIES = [
  "Information Technology",
  "Finance & Accounts",
  "Healthcare & Nursing",
  "Education & Teaching",
  "Engineering & Construction",
  "Sales & Marketing",
];

export const FALLBACK_DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

/* ---- API enum values (must match the back end exactly) ------------------ */

export const EMPLOYMENT_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "temporary", label: "Temporary" },
];

export const WORK_MODES = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

export const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry level" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
  { value: "executive", label: "Executive" },
];

export const EDUCATION_LEVELS = [
  { value: "any", label: "Any education" },
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor's degree" },
  { value: "masters", label: "Master's degree" },
  { value: "doctorate", label: "Doctorate" },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "relevant", label: "Most relevant" },
  { value: "salary_desc", label: "Salary: high to low" },
  { value: "salary_asc", label: "Salary: low to high" },
];

export const JOB_STATUSES = ["draft", "pending", "approved", "rejected", "closed"];

export const APPLICATION_STATUSES = [
  "applied",
  "shortlisted",
  "interview",
  "rejected",
  "hired",
  "withdrawn",
];

export const USER_ROLES = [
  { value: "seeker", label: "Job seeker" },
  { value: "employer", label: "Employer" },
  { value: "admin", label: "Administrator" },
];

/* ---- Labels ------------------------------------------------------------- */

const LABELS = {
  employmentType: Object.fromEntries(EMPLOYMENT_TYPES.map((o) => [o.value, o.label])),
  workMode: Object.fromEntries(WORK_MODES.map((o) => [o.value, o.label])),
  experienceLevel: Object.fromEntries(EXPERIENCE_LEVELS.map((o) => [o.value, o.label])),
  educationLevel: Object.fromEntries(EDUCATION_LEVELS.map((o) => [o.value, o.label])),
  status: {
    draft: "Draft",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    closed: "Closed",
    applied: "Applied",
    shortlisted: "Shortlisted",
    interview: "Interview",
    hired: "Hired",
    withdrawn: "Withdrawn",
  },
};

/**
 * Turn an API enum value into the label shown to the user.
 * Unknown values are returned unchanged so nothing ever renders blank.
 */
export function labelFor(kind, value) {
  if (!value) return "";
  const table = LABELS[kind];
  if (!table) return String(value);
  return table[String(value).toLowerCase()] ?? String(value);
}

/* ---- CV ----------------------------------------------------------------- */

export const CV_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const CV_EXTENSIONS = [".pdf", ".docx"];
export const CV_ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
