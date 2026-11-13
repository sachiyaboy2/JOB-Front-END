import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import { Reveal } from "../../components/brand/useReveal.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { useReference } from "../../context/ReferenceContext.jsx";
import { apiErrorMessage, jobsApi } from "../../api.js";
import { toEntity } from "../../utils/data.js";
import { toList } from "../../utils/format.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import {
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  WORK_MODES,
} from "../../utils/constants.js";

const EMPTY = {
  title: "",
  category: "",
  description: "",
  responsibilities: "",
  qualifications: "",
  experienceRequired: "",
  experienceLevel: "entry",
  educationLevel: "any",
  skills: "",
  location: "",
  district: "",
  employmentType: "full-time",
  workMode: "onsite",
  salaryMin: "",
  salaryMax: "",
  benefits: "",
  vacancies: "1",
  deadline: "",
};

export default function EmployerJobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { categories, districts } = useReference();

  useDocumentTitle(isEdit ? "Edit job" : "Post a job");

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(null);

  const existing = useFetch(() => (isEdit ? jobsApi.get(id) : Promise.resolve(null)), [id]);

  useEffect(() => {
    if (!isEdit) return;
    const job = toEntity(existing.data);
    if (!job) return;
    setValues({
      title: job.title || "",
      category: job.category || "",
      description: job.description || "",
      responsibilities: job.responsibilities || "",
      qualifications: job.qualifications || "",
      experienceRequired: job.experienceRequired || "",
      experienceLevel: job.experienceLevel || "entry",
      educationLevel: job.educationLevel || "any",
      skills: toList(job.skills).join(", "),
      location: job.location || "",
      district: job.district || "",
      employmentType: job.employmentType || "full-time",
      workMode: job.workMode || "onsite",
      salaryMin: job.salaryMin ?? "",
      salaryMax: job.salaryMax ?? "",
      benefits: job.benefits || "",
      vacancies: job.vacancies ?? "1",
      deadline: job.deadline ? String(job.deadline).slice(0, 10) : "",
    });
  }, [existing.data, isEdit]);

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.title.trim()) next.title = "Give the role a title.";
    if (!values.category) next.category = "Choose a category.";
    if (!values.description.trim() || values.description.trim().length < 30)
      next.description = "Describe the role in at least 30 characters.";
    if (!values.location.trim()) next.location = "Where is this role based?";
    if (!values.deadline) next.deadline = "Set an application deadline.";
    if (values.salaryMin && values.salaryMax && Number(values.salaryMin) > Number(values.salaryMax))
      next.salaryMax = "The maximum salary must be higher than the minimum.";
    if (values.vacancies && Number(values.vacancies) < 1) next.vacancies = "At least one vacancy.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const payload = (status) => ({
    title: values.title.trim(),
    category: values.category,
    description: values.description.trim(),
    responsibilities: values.responsibilities.trim(),
    qualifications: values.qualifications.trim(),
    experienceRequired: values.experienceRequired.trim(),
    experienceLevel: values.experienceLevel,
    educationLevel: values.educationLevel,
    skills: toList(values.skills),
    location: values.location.trim(),
    district: values.district,
    employmentType: values.employmentType,
    workMode: values.workMode,
    salaryMin: values.salaryMin ? Number(values.salaryMin) : 0,
    salaryMax: values.salaryMax ? Number(values.salaryMax) : 0,
    benefits: values.benefits.trim(),
    vacancies: values.vacancies ? Number(values.vacancies) : 1,
    deadline: values.deadline || null,
    status,
  });

  const save = async (status) => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(status);
    try {
      if (isEdit) {
        await jobsApi.update(id, payload(status));
        toast.success(status === "draft" ? "Draft saved" : "Job submitted for approval");
      } else {
        await jobsApi.create(payload(status));
        toast.success(status === "draft" ? "Draft saved" : "Job submitted for approval");
      }
      navigate("/employer/jobs");
    } catch (err) {
      toast.error(apiErrorMessage(err, "The job could not be saved."));
    } finally {
      setSaving(null);
    }
  };

  if (isEdit && existing.loading) {
    return (
      <Page>
        <div className="surface space-y-4 p-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </Page>
    );
  }

  if (isEdit && existing.error) {
    return (
      <Page>
        <ErrorState
          title="We could not load this job"
          message={apiErrorMessage(existing.error, "The job may have been removed.")}
          onRetry={existing.reload}
        />
      </Page>
    );
  }

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
          {isEdit ? "Edit job" : "Post a job"}
        </h1>
        <p className="mt-2 text-ink-muted">
          {isEdit
            ? "Update the advert. Approved adverts go live again after a quick review."
            : "Save a draft while you write, or submit it for approval straight away."}
        </p>
      </header>

      <form onSubmit={(event) => event.preventDefault()} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Reveal>
            <section aria-labelledby="job-basics" className="surface p-6">
              <h2 id="job-basics" className="font-display text-lg font-semibold text-ink">
                The basics
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="job-title" className="label">
                    Job title
                  </label>
                  <input
                    id="job-title"
                    type="text"
                    value={values.title}
                    onChange={update("title")}
                    placeholder="Senior Frontend Developer"
                    aria-invalid={Boolean(errors.title)}
                    className={`field ${errors.title ? "field-invalid" : ""}`}
                  />
                  {errors.title ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{errors.title}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="job-category" className="label">
                    Category
                  </label>
                  <select
                    id="job-category"
                    value={values.category}
                    onChange={update("category")}
                    aria-invalid={Boolean(errors.category)}
                    className={`field ${errors.category ? "field-invalid" : ""}`}
                  >
                    <option value="">Choose a category</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {errors.category ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{errors.category}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="job-location" className="label">
                    Location
                  </label>
                  <input
                    id="job-location"
                    type="text"
                    value={values.location}
                    onChange={update("location")}
                    placeholder="Colombo 03"
                    aria-invalid={Boolean(errors.location)}
                    className={`field ${errors.location ? "field-invalid" : ""}`}
                  />
                  {errors.location ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{errors.location}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="job-district" className="label">
                    District
                  </label>
                  <select id="job-district" value={values.district} onChange={update("district")} className="field">
                    <option value="">Select a district</option>
                    {districts.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="job-employment" className="label">
                    Employment type
                  </label>
                  <select
                    id="job-employment"
                    value={values.employmentType}
                    onChange={update("employmentType")}
                    className="field"
                  >
                    {EMPLOYMENT_TYPES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="job-workmode" className="label">
                    Work mode
                  </label>
                  <select id="job-workmode" value={values.workMode} onChange={update("workMode")} className="field">
                    {WORK_MODES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="job-experience" className="label">
                    Experience level
                  </label>
                  <select
                    id="job-experience"
                    value={values.experienceLevel}
                    onChange={update("experienceLevel")}
                    className="field"
                  >
                    {EXPERIENCE_LEVELS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="job-education" className="label">
                    Education level
                  </label>
                  <select
                    id="job-education"
                    value={values.educationLevel}
                    onChange={update("educationLevel")}
                    className="field"
                  >
                    {EDUCATION_LEVELS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="job-salary-min" className="label">
                    Minimum salary (LKR / month)
                  </label>
                  <input
                    id="job-salary-min"
                    type="number"
                    min="0"
                    step="1000"
                    inputMode="numeric"
                    value={values.salaryMin}
                    onChange={update("salaryMin")}
                    placeholder="120000"
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="job-salary-max" className="label">
                    Maximum salary (LKR / month)
                  </label>
                  <input
                    id="job-salary-max"
                    type="number"
                    min="0"
                    step="1000"
                    inputMode="numeric"
                    value={values.salaryMax}
                    onChange={update("salaryMax")}
                    placeholder="250000"
                    aria-invalid={Boolean(errors.salaryMax)}
                    className={`field ${errors.salaryMax ? "field-invalid" : ""}`}
                  />
                  {errors.salaryMax ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{errors.salaryMax}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="job-vacancies" className="label">
                    Number of vacancies
                  </label>
                  <input
                    id="job-vacancies"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={values.vacancies}
                    onChange={update("vacancies")}
                    aria-invalid={Boolean(errors.vacancies)}
                    className={`field ${errors.vacancies ? "field-invalid" : ""}`}
                  />
                  {errors.vacancies ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{errors.vacancies}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="job-deadline" className="label">
                    Application deadline
                  </label>
                  <input
                    id="job-deadline"
                    type="date"
                    value={values.deadline}
                    onChange={update("deadline")}
                    aria-invalid={Boolean(errors.deadline)}
                    className={`field ${errors.deadline ? "field-invalid" : ""}`}
                  />
                  {errors.deadline ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{errors.deadline}</p>
                  ) : null}
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section aria-labelledby="job-description" className="surface p-6">
              <h2 id="job-description" className="font-display text-lg font-semibold text-ink">
                Description
              </h2>
              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="job-description-text" className="label">
                    Role description
                  </label>
                  <textarea
                    id="job-description-text"
                    rows={7}
                    value={values.description}
                    onChange={update("description")}
                    placeholder="What the person will do, who they will work with and what success looks like."
                    aria-invalid={Boolean(errors.description)}
                    className={`field resize-y ${errors.description ? "field-invalid" : ""}`}
                  />
                  {errors.description ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{errors.description}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="job-responsibilities" className="label">
                    Responsibilities
                  </label>
                  <textarea
                    id="job-responsibilities"
                    rows={5}
                    value={values.responsibilities}
                    onChange={update("responsibilities")}
                    placeholder={"- Own the frontend of the product\n- Review code from the team"}
                    className="field resize-y"
                  />
                </div>

                <div>
                  <label htmlFor="job-qualifications" className="label">
                    Qualifications
                  </label>
                  <textarea
                    id="job-qualifications"
                    rows={5}
                    value={values.qualifications}
                    onChange={update("qualifications")}
                    placeholder={"- BEng in Computer Science\n- 3+ years with React"}
                    className="field resize-y"
                  />
                </div>

                <div>
                  <label htmlFor="job-skills" className="label">
                    Skills
                  </label>
                  <input
                    id="job-skills"
                    type="text"
                    value={values.skills}
                    onChange={update("skills")}
                    placeholder="React, TypeScript, Figma"
                    className="field"
                  />
                  <p className="mt-1.5 text-xs text-ink-muted">Separate each skill with a comma.</p>
                </div>

                <div>
                  <label htmlFor="job-experience-required" className="label">
                    Experience required
                  </label>
                  <input
                    id="job-experience-required"
                    type="text"
                    value={values.experienceRequired}
                    onChange={update("experienceRequired")}
                    placeholder="3+ years of hands-on React work"
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="job-benefits" className="label">
                    Benefits
                  </label>
                  <textarea
                    id="job-benefits"
                    rows={3}
                    value={values.benefits}
                    onChange={update("benefits")}
                    placeholder="Transport allowance, medical insurance, birthday leave"
                    className="field resize-y"
                  />
                </div>
              </div>
            </section>
          </Reveal>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => save("pending")}
              disabled={Boolean(saving)}
            >
              {saving === "pending" ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="send" size={16} />}
              Submit for approval
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => save("draft")}
              disabled={Boolean(saving)}
            >
              {saving === "draft" ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="fileText" size={16} />}
              Save as draft
            </button>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card-glow surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">How approval works</h2>
            <ol className="mt-4 space-y-3 text-sm text-ink-muted">
              {[
                "Submit the advert for approval",
                "An administrator reviews the details",
                "Approved adverts go live on the portal",
                "Applicants can then send their CV",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aurora-500/12 font-mono text-xs font-bold text-aurora-600 dark:text-aurora-300">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">Writing tips</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              {[
                "Lead with the actual job title",
                "Give a salary range — it doubles the replies",
                "Keep the description under 400 words",
                "List the top three skills only",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <Icon name="checkCircle" size={16} className="mt-0.5 shrink-0 text-success" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </form>
    </Page>
  );
}
