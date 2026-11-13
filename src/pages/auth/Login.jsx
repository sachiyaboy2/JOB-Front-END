import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiErrorMessage } from "../../api.js";
import { useDocumentTitle } from "../../utils/hooks.js";

export default function Login() {
  useDocumentTitle("Sign in");

  const navigate = useNavigate();
  const location = useLocation();
  const { login, homePathForRole } = useAuth();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.email.trim()) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next.email = "That email address does not look right.";
    if (!values.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const user = await login(values.email.trim(), values.password);
      toast.success(`Welcome back, ${user?.name?.split(" ")[0] || "there"}!`);
      const redirect = location.state?.from;
      navigate(redirect || homePathForRole(user?.role), { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, "We could not sign you in."));
      setErrors({ password: "Check your email and password and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <div className="mx-auto flex max-w-md flex-col">
        <div className="text-center">
          <span className="badge badge-accent">Welcome back</span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">Sign in</h1>
          <p className="mt-2 text-ink-muted">
            New here?{" "}
            <Link to="/register" className="font-semibold text-aurora-600 hover:underline dark:text-aurora-300">
              Create an account
            </Link>
          </p>
        </div>

        <form onSubmit={submit} noValidate className="card-glow surface mt-8 space-y-5 p-6 sm:p-7">
          <div>
            <label htmlFor="login-email" className="label">
              Email address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
                <Icon name="mail" size={16} />
              </span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={update("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : undefined}
                className={`field !pl-10 ${errors.email ? "field-invalid" : ""}`}
              />
            </div>
            {errors.email ? (
              <p id="login-email-error" className="mt-1.5 text-xs font-medium text-danger">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="login-password" className="label">
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
                <Icon name="lock" size={16} />
              </span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={values.password}
                onChange={update("password")}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                className={`field !pl-10 !pr-11 ${errors.password ? "field-invalid" : ""}`}
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
              <p id="login-password-error" className="mt-1.5 text-xs font-medium text-danger">
                {errors.password}
              </p>
            ) : null}
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="key" size={16} />}
            Sign in
          </button>

          <p className="text-center text-xs text-ink-muted">
            Trouble signing in?{" "}
            <Link to="/contact" className="font-semibold text-aurora-600 hover:underline dark:text-aurora-300">
              Contact support
            </Link>
          </p>
        </form>
      </div>
    </Page>
  );
}
