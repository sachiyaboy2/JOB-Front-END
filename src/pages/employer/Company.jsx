import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import { Reveal } from "../../components/brand/useReveal.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { CompanyMark } from "../../components/ui/JobCard.jsx";
import { apiErrorMessage, authApi, companiesApi } from "../../api.js";
import { toEntity } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { useReference } from "../../context/ReferenceContext.jsx";

const EMPTY = {
  name: "",
  logoUrl: "",
  description: "",
  industry: "",
  address: "",
  district: "",
  website: "",
  contactPerson: "",
  contactEmail: "",
  contactPhone: "",
};

export default function EmployerCompany() {
  useDocumentTitle("Company profile");

  const { districts } = useReference();
  const [values, setValues] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // The company record hangs off the signed-in user; the contract has no
  // dedicated "my company" read route, so the user is read first.
  const mine = useFetch(() => authApi.me(), []);

  useEffect(() => {
    const user = toEntity(mine.data) || {};
    setValues({
      name: user.companyName || "",
      logoUrl: "",
      description: "",
      industry: "",
      address: "",
      district: user.district || "",
      website: "",
      contactPerson: user.name || "",
      contactEmail: user.email || "",
      contactPhone: user.phone || "",
    });
  }, [mine.data]);

  // Once the user id is known, pull the company record itself.
  const user = toEntity(mine.data) || {};
  const companyId = user.company || null;
  const company = useFetch(() => companiesApi.mine(companyId), [companyId]);

  useEffect(() => {
    const record = toEntity(company.data);
    if (!record) return;
    setValues((current) => ({
      ...current,
      name: record.name || current.name,
      logoUrl: record.logoUrl || "",
      description: record.description || "",
      industry: record.industry || "",
      address: record.address || "",
      district: record.district || current.district,
      website: record.website || "",
      contactPerson: record.contactPerson || current.contactPerson,
      contactEmail: record.contactEmail || current.contactEmail,
      contactPhone: record.contactPhone || current.contactPhone,
    }));
  }, [company.data]);

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Your company name is required.";
    if (values.website && !/^https?:\/\/.+/i.test(values.website.trim()))
      next.website = "Include http:// or https://";
    if (values.logoUrl && !/^https?:\/\/.+/i.test(values.logoUrl.trim()))
      next.logoUrl = "The logo must be a full image URL.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await companiesApi.updateMine({
        name: values.name.trim(),
        logoUrl: values.logoUrl.trim(),
        description: values.description.trim(),
        industry: values.industry.trim(),
        address: values.address.trim(),
        district: values.district,
        website: values.website.trim(),
        contactPerson: values.contactPerson.trim(),
        contactEmail: values.contactEmail.trim(),
        contactPhone: values.contactPhone.trim(),
      });
      toast.success("Company profile saved");
      company.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The company profile could not be saved."));
    } finally {
      setSaving(false);
    }
  };

  if (mine.loading) {
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

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Company profile</h1>
        <p className="mt-2 text-ink-muted">
          This is what candidates see on your adverts. Complete profiles get more applications.
        </p>
      </header>

      <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Reveal>
            <section aria-labelledby="company-basics" className="surface p-6">
              <h2 id="company-basics" className="font-display text-lg font-semibold text-ink">
                Company details
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="company-name" className="label">
                    Company name
                  </label>
                  <input
                    id="company-name"
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

                <div>
                  <label htmlFor="company-industry" className="label">
                    Industry
                  </label>
                  <input
                    id="company-industry"
                    type="text"
                    value={values.industry}
                    onChange={update("industry")}
                    placeholder="Information Technology"
                    className="field"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="company-logo" className="label">
                    Logo URL
                  </label>
                  <input
                    id="company-logo"
                    type="url"
                    value={values.logoUrl}
                    onChange={update("logoUrl")}
                    placeholder="https://example.com/logo.png"
                    aria-invalid={Boolean(errors.logoUrl)}
                    className={`field ${errors.logoUrl ? "field-invalid" : ""}`}
                  />
                  {errors.logoUrl ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{errors.logoUrl}</p>
                  ) : null}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="company-description" className="label">
                    About the company
                  </label>
                  <textarea
                    id="company-description"
                    rows={6}
                    value={values.description}
                    onChange={update("description")}
                    placeholder="What your company does, who you serve and what it is like to work here."
                    className="field resize-y"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="company-address" className="label">
                    Address
                  </label>
                  <input
                    id="company-address"
                    type="text"
                    value={values.address}
                    onChange={update("address")}
                    placeholder="No. 24, Galle Road, Colombo 03"
                    className="field"
                  />
                </div>

                <div>
                  <label htmlFor="company-district" className="label">
                    District
                  </label>
                  <select
                    id="company-district"
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

                <div className="sm:col-span-2">
                  <label htmlFor="company-website" className="label">
                    Website
                  </label>
                  <input
                    id="company-website"
                    type="url"
                    value={values.website}
                    onChange={update("website")}
                    placeholder="https://example.lk"
                    aria-invalid={Boolean(errors.website)}
                    className={`field ${errors.website ? "field-invalid" : ""}`}
                  />
                  {errors.website ? (
                    <p className="mt-1.5 text-xs font-medium text-danger">{errors.website}</p>
                  ) : null}
                </div>
              </div>
            </section>
          </Reveal>

          <Reveal>
            <section aria-labelledby="company-contact" className="surface p-6">
              <h2 id="company-contact" className="font-display text-lg font-semibold text-ink">
                Contact person
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-person" className="label">
                    Full name
                  </label>
                  <input
                    id="contact-person"
                    type="text"
                    value={values.contactPerson}
                    onChange={update("contactPerson")}
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="label">
                    Contact email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={values.contactEmail}
                    onChange={update("contactEmail")}
                    className="field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="contact-phone" className="label">
                    Contact phone
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={values.contactPhone}
                    onChange={update("contactPhone")}
                    className="field"
                  />
                </div>
              </div>
            </section>
          </Reveal>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="check" size={16} />}
            Save company profile
          </button>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card-glow surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">Preview</h2>
            <div className="mt-4 flex items-center gap-3">
              <CompanyMark logo={values.logoUrl} name={values.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-ink">
                  {values.name || "Your company"}
                </p>
                <p className="truncate text-xs text-ink-muted">{values.industry || "Industry"}</p>
              </div>
            </div>
            <p className="mt-4 line-clamp-5 text-sm text-ink-2">
              {values.description || "Your company description will appear here."}
            </p>
            {values.website ? (
              <a
                href={values.website.startsWith("http") ? values.website : `https://${values.website}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-aurora-600 hover:underline dark:text-aurora-300"
              >
                <Icon name="globe" size={14} /> {values.website}
              </a>
            ) : null}
          </div>

          <div className="surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">Why it matters</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              {[
                "Verified profiles get a trust badge",
                "A logo and industry raise reply rates",
                "Clear contact details speed up shortlisting",
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
