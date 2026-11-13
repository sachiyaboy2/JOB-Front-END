import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import { Reveal } from "../../components/brand/useReveal.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useReference } from "../../context/ReferenceContext.jsx";
import { apiErrorMessage, authApi, profileApi } from "../../api.js";
import { toEntity } from "../../utils/data.js";
import { toList } from "../../utils/format.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";

const FIELDS = [
  { key: "phone", label: "Phone number", type: "tel", placeholder: "+94 77 000 0000" },
  { key: "location", label: "Location", type: "text", placeholder: "Colombo 03" },
  { key: "education", label: "Education", type: "text", placeholder: "BSc (Hons) Information Technology" },
  { key: "experience", label: "Experience", type: "text", placeholder: "3 years" },
  { key: "expectedSalary", label: "Expected salary (LKR / month)", type: "number", placeholder: "180000" },
];

const LINKS = [
  { key: "portfolio", label: "Portfolio link", type: "url", placeholder: "https://yourportfolio.com" },
  { key: "linkedin", label: "LinkedIn profile", type: "url", placeholder: "https://linkedin.com/in/you" },
  { key: "website", label: "Personal website", type: "url", placeholder: "https://yourname.lk" },
];

export default function SeekerProfile() {
  useDocumentTitle("My profile");

  const { user, refreshUser } = useAuth();
  const { districts } = useReference();

  const { data, loading, error, reload } = useFetch(() => authApi.me(), []);
  const profile = toEntity(data) || user || {};

  const [values, setValues] = useState({
    name: "",
    phone: "",
    district: "",
    location: "",
    education: "",
    experience: "",
    skills: "",
    languages: "",
    summary: "",
    expectedSalary: "",
    portfolio: "",
    linkedin: "",
    website: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [savedLocally, setSavedLocally] = useState(false);

  useEffect(() => {
    const local = loadLocally();
    setValues({
      name: profile.name || "",
      phone: profile.phone || "",
      district: profile.district || "",
      location: local?.location || "",
      education: local?.education || "",
      experience: local?.experience || "",
      skills: local?.skills || "",
      languages: local?.languages || "",
      summary: local?.summary || "",
      expectedSalary: local?.expectedSalary || "",
      portfolio: local?.portfolio || "",
      linkedin: local?.linkedin || "",
      website: local?.website || "",
    });
  }, [profile]);

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Your name is required.";
    if (values.expectedSalary && Number(values.expectedSalary) < 0)
      next.expectedSalary = "Enter a positive number.";
    ["portfolio", "linkedin", "website"].forEach((key) => {
      const value = values[key].trim();
      if (value && !/^https?:\/\/.+/i.test(value)) next[key] = "Include http:// or https://";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await updateProfile(values);
      toast.success("Profile saved");
      await refreshUser().catch(() => {});
      reload();
    } catch (err) {
      // The published contract has no profile-write route yet. Keep the edits
      // on this device so nothing is lost and say so plainly.
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        saveLocally(values);
        toast(
          "The API cannot store profile details yet — your edits were kept on this device.",
          { icon: "💾", duration: 6000 },
        );
        setSavedLocally(true);
      } else {
        toast.error(
          apiErrorMessage(
            err,
            "The profile service is not available right now. Your edits are still on screen — try again in a moment.",
          ),
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <div className="surface space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <ErrorState
          title="We could not load your profile"
          message={apiErrorMessage(error, "The profile service is not responding.")}
          onRetry={reload}
        />
      </Page>
    );
  }

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">My profile</h1>
        <p className="mt-2 text-ink-muted">
          A complete profile helps employers shortlist you faster.
        </p>
      </header>

      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Reveal>
            <section aria-labelledby="profile-basics" className="surface p-6">
              <h2 id="profile-basics" className="font-display text-lg font-semibold text-ink">
                Basics
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="profile-name" className="label">
                    Full name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={values.name}
                    onChange={update("name")}
                    aria-invalid={Boolean(errors.name)}
                    className={`field ${errors.name ? "field-invalid" : ""}`}
                  />
                  {errors.name ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{errors.name}</p>
                  ) : null}
                </div>

                {FIELDS.map((field) => (
                  <div key={field.key}>
                    <label htmlFor={`profile-${field.key}`} className="label">
                      {field.label}
                    </label>
                    <input
                      id={`profile-${field.key}`}
                      type={field.type}
                      value={values[field.key]}
                      onChange={update(field.key)}
                      placeholder={field.placeholder}
                      aria-invalid={Boolean(errors[field.key])}
                      className={`field ${errors[field.key] ? "field-invalid" : ""}`}
                    />
                    {errors[field.key] ? (
                      <p className="mt-1.5 text-xs font-medium text-danger">{errors[field.key]}</p>
                    ) : null}
                  </div>
                ))}

                <div className="sm:col-span-2">
                  <label htmlFor="profile-district" className="label">
                    District
                  </label>
                  <select
                    id="profile-district"
                    value={values.district}
                    onChange={update("district")}
                    className="field"
                  >
                    <option value="">Select a district</option>
                    {districts.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section aria-labelledby="profile-about" className="surface p-6">
              <h2 id="profile-about" className="font-display text-lg font-semibold text-ink">
                About you
              </h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="profile-summary" className="label">
                    Professional summary
                  </label>
                  <textarea
                    id="profile-summary"
                    rows={5}
                    value={values.summary}
                    onChange={update("summary")}
                    placeholder="A few lines about your experience and what you are looking for next."
                    className="field resize-y"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="profile-skills" className="label">
                      Skills
                    </label>
                    <input
                      id="profile-skills"
                      type="text"
                      value={values.skills}
                      onChange={update("skills")}
                      placeholder="React, Node.js, SQL"
                      className="field"
                    />
                    <p className="mt-1.5 text-xs text-ink-muted">Separate each skill with a comma.</p>
                  </div>
                  <div>
                    <label htmlFor="profile-languages" className="label">
                      Languages
                    </label>
                    <input
                      id="profile-languages"
                      type="text"
                      value={values.languages}
                      onChange={update("languages")}
                      placeholder="Sinhala, English, Tamil"
                      className="field"
                    />
                    <p className="mt-1.5 text-xs text-ink-muted">Separate each language with a comma.</p>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section aria-labelledby="profile-links" className="surface p-6">
              <h2 id="profile-links" className="font-display text-lg font-semibold text-ink">
                Portfolio links
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {LINKS.map((link) => (
                  <div key={link.key} className={link.key === "website" ? "sm:col-span-2" : ""}>
                    <label htmlFor={`profile-${link.key}`} className="label">
                      {link.label}
                    </label>
                    <input
                      id={`profile-${link.key}`}
                      type="url"
                      value={values[link.key]}
                      onChange={update(link.key)}
                      placeholder={link.placeholder}
                      aria-invalid={Boolean(errors[link.key])}
                      className={`field ${errors[link.key] ? "field-invalid" : ""}`}
                    />
                    {errors[link.key] ? (
                      <p className="mt-1.5 text-xs font-medium text-danger">{errors[link.key]}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="check" size={16} />}
              Save changes
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setValues(values)} disabled={saving}>
              Discard edits
            </button>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card-glow surface p-6">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-500 to-violet-glow font-display text-xl font-bold text-white shadow-e2">
              {(values.name || "U").slice(0, 1).toUpperCase()}
            </span>
            <p className="mt-4 font-display text-lg font-semibold text-ink">{values.name || "Your name"}</p>
            <p className="text-sm text-ink-muted">{profile.email || user?.email}</p>

            <dl className="mt-5 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">District</dt>
                <dd className="font-medium text-ink">{values.district || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Experience</dt>
                <dd className="font-medium text-ink">{values.experience || "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Skills</dt>
                <dd className="font-medium text-ink">{toList(values.skills).length}</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-lg border border-line bg-surface-2/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Profile strength</p>
              <p className="mt-1 text-sm text-ink-2">
                {profileComplete(values)}% complete. Fill in the summary, skills and links to get noticed.
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-aurora-500 to-violet-glow transition-all duration-500"
                  style={{ width: `${profileComplete(values)}%` }}
                />
              </div>
              {savedLocally ? (
                <p className="mt-3 text-xs text-warning">
                  The API cannot store profile details yet, so these edits live on this device only.
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </form>
    </Page>
  );
}

/** Rough completeness score for the sidebar meter. */
function profileComplete(values) {
  const fields = [
    values.name,
    values.phone,
    values.district,
    values.education,
    values.experience,
    values.skills,
    values.languages,
    values.summary,
    values.expectedSalary,
    values.portfolio,
  ];
  const filled = fields.filter((value) => String(value || "").trim()).length;
  return Math.round((filled / fields.length) * 100);
}

/**
 * Save the seeker profile.
 *
 * The published API contract has no profile-update route, so the front end
 * posts to the conventional `PATCH /api/users/me`. If the back end has not
 * implemented it yet the caller falls back to a local copy.
 */
async function updateProfile(values) {
  return profileApi.update({
    name: values.name.trim(),
    phone: values.phone.trim(),
    district: values.district,
    location: values.location.trim(),
    education: values.education.trim(),
    experience: values.experience.trim(),
    skills: toList(values.skills),
    languages: toList(values.languages),
    summary: values.summary.trim(),
    expectedSalary: values.expectedSalary ? Number(values.expectedSalary) : null,
    portfolio: values.portfolio.trim(),
    linkedin: values.linkedin.trim(),
    website: values.website.trim(),
  });
}

const LOCAL_KEY = "ob.profile";

/** Keep the edits on this device until the API can store them. */
function saveLocally(values) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(values));
  } catch {
    /* storage unavailable — the values stay on screen only */
  }
}

function loadLocally() {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
