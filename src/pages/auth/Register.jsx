import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiErrorMessage } from "../../api.js";
import { useDocumentTitle } from "../../utils/hooks.js";

const ROLE_CARDS = [
  {
    value: "seeker",
    icon: "user",
    title: "Job seeker",
    copy: "Find roles, save jobs, upload your CV and track applications.",
  },
  {
    value: "employer",
    icon: "building",
    title: "Employer",
    copy: "Post vacancies, manage applicants and build your hiring pipeline.",
  },
];

export default function Register() {
  useDocumentTitle("Create an account");

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { register, homePathForRole } = useAuth();

  const initialRole = params.get("role") === "employer" ? "employer" : "seeker";
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
  });
  const [role, setRole] = useState(initialRole);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Enter your full name.";
    if (!values.email.trim()) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next.email = "That email address does not look right.";
    if (!values.password) next.password = "Choose a password.";
    else if (values.password.length < 8) next.password = "Use at least 8 characters.";
    if (values.confirmPassword !== values.password) next.confirmPassword = "Both passwords must match.";
    if (role === "employer" && !values.companyName.trim()) next.companyName = "Enter your company name.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await register({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role,
        ...(role === "employer" ? { companyName: values.companyName.trim() } : {}),
      });
      toast.success("Account created — welcome to Jobelza!");
      navigate(homePathForRole(user?.role || role), { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, "We could not create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <div className="mx-auto max-w-lg">
        <div className="text-center">
          <span className="badge badge-accent">Get started</span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Create your account
          </h1>
          <p className="mt-2 text-ink-muted">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-aurora-600 hover:underline dark:text-aurora-300">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={submit} noValidate className="card-glow surface mt-8 space-y-5 p-6 sm:p-7">
          <fieldset>
            <legend className="label">I am registering as</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLE_CARDS.map((card) => {
                const selected = role === card.value;
                return (
                  <label
                    key={card.value}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-all duration-200 ${
                      selected
                        ? "border-aurora-500 bg-aurora-500/8 shadow-glow"
                        : "border-line hover:border-line-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={card.value}
                      checked={selected}
                      onChange={() => setRole(card.value)}
                      className="sr-only"
                    />
                    <span
                      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        selected ? "bg-aurora-500 text-white" : "bg-surface-2 text-ink-muted"
                      }`}
                    >
                      <Icon name={card.icon} size={19} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-sm font-semibold text-ink">{card.title}</span>
                      <span className="mt-0.5 block text-xs text-ink-muted">{card.copy}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label htmlFor="register-name" className="label">
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={update("name")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "register-name-error" : undefined}
              className={`field ${errors.name ? "field-invalid" : ""}`}
            />
            {errors.name ? (
              <p id="register-name-error" className="mt-1.5 text-xs font-medium text-danger">
                {errors.name}
              </p>
            ) : null}
          </div>

          {role === "employer" ? (
            <div>
              <label htmlFor="register-company" className="label">
                Company name
              </label>
              <input
                id="register-company"
                type="text"
                autoComplete="organization"
                value={values.companyName}
                onChange={update("companyName")}
                aria-invalid={Boolean(errors.companyName)}
                aria-describedby={errors.companyName ? "register-company-error" : undefined}
                className={`field ${errors.companyName ? "field-invalid" : ""}`}
              />
              {errors.companyName ? (
                <p id="register-company-error" className="mt-1.5 text-xs font-medium text-danger">
                  {errors.companyName}
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <label htmlFor="register-email" className="label">
              Email address
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={update("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "register-email-error" : undefined}
              className={`field ${errors.email ? "field-invalid" : ""}`}
            />
            {errors.email ? (
              <p id="register-email-error" className="mt-1.5 text-xs font-medium text-danger">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="register-password" className="label">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={values.password}
                onChange={update("password")}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "register-password-error" : undefined}
                className={`field !pr-11 ${errors.password ? "field-invalid" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-ink-muted transition-colors hover:text-ink"
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
              </button>
            </div>
            {errors.password ? (
              <p id="register-password-error" className="mt-1.5 text-xs font-medium text-danger">
                {errors.password}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-ink-muted">Use at least 8 characters.</p>
            )}
          </div>

          <div>
            <label htmlFor="register-confirm" className="label">
              Confirm password
            </label>
            <input
              id="register-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={update("confirmPassword")}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "register-confirm-error" : undefined}
              className={`field ${errors.confirmPassword ? "field-invalid" : ""}`}
            />
            {errors.confirmPassword ? (
              <p id="register-confirm-error" className="mt-1.5 text-xs font-medium text-danger">
                {errors.confirmPassword}
              </p>
            ) : null}
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="sparkles" size={16} />}
            Create account
          </button>

          <p className="text-center text-xs text-ink-muted">
            By creating an account you agree to the terms of use and the privacy policy.
          </p>
        </form>
      </div>
    </Page>
  );
}
