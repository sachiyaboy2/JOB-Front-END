import { useState } from "react";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import { apiErrorMessage, contactApi } from "../../api.js";
import { useDocumentTitle } from "../../utils/hooks.js";

const EMPTY = { name: "", email: "", message: "" };

export default function Contact() {
  useDocumentTitle("Contact");
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Please tell us your name.";
    if (!values.email.trim()) next.email = "An email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = "That email address does not look right.";
    if (!values.message.trim()) next.message = "Please write a message.";
    else if (values.message.trim().length < 10) next.message = "Please add a little more detail.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      await contactApi.send({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setSent(true);
      setValues(EMPTY);
      toast.success("Message sent — we will reply shortly.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "We could not send your message."));
    } finally {
      setSending(false);
    }
  };

  return (
    <Page>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="contact-heading">
          <span className="badge badge-accent">Contact</span>
          <h1 id="contact-heading" className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Talk to the Jobelza team
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-ink-muted">
            Questions about a job, a listing, or an employer account? Send us a message and we will get back to
            you.
          </p>

          {sent ? (
            <div role="status" className="surface mt-7 flex items-start gap-3 border-success/40 p-6">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/12 text-success">
                <Icon name="checkCircle" size={20} />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">Message sent</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Thanks for reaching out. Our team replies to enquiries within one working day.
                </p>
                <button type="button" className="btn btn-secondary mt-4" onClick={() => setSent(false)}>
                  Send another message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="surface mt-7 space-y-5 p-6 sm:p-7">
              <div>
                <label htmlFor="contact-name" className="label">
                  Your name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={update("name")}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className={`field ${errors.name ? "field-invalid" : ""}`}
                />
                {errors.name ? (
                  <p id="contact-name-error" className="mt-1.5 text-xs font-medium text-danger">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="contact-email" className="label">
                  Email address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={update("email")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className={`field ${errors.email ? "field-invalid" : ""}`}
                />
                {errors.email ? (
                  <p id="contact-email-error" className="mt-1.5 text-xs font-medium text-danger">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor="contact-message" className="label">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={6}
                  value={values.message}
                  onChange={update("message")}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className={`field resize-y ${errors.message ? "field-invalid" : ""}`}
                />
                {errors.message ? (
                  <p id="contact-message-error" className="mt-1.5 text-xs font-medium text-danger">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? <Icon name="loader" size={16} className="animate-spin" /> : <Icon name="send" size={16} />}
                Send message
              </button>
            </form>
          )}
        </section>

        <aside className="space-y-4">
          <div className="surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">Other ways to reach us</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                  <Icon name="mail" size={17} />
                </span>
                <span>
                  <span className="block font-medium text-ink">Email</span>
                  <a href="mailto:support@jobportal.lk" className="text-ink-muted hover:underline">
                    support@jobportal.lk
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                  <Icon name="phone" size={17} />
                </span>
                <span>
                  <span className="block font-medium text-ink">Phone</span>
                  <a href="tel:+94115550123" className="text-ink-muted hover:underline">
                    +94 11 555 0123
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                  <Icon name="mapPin" size={17} />
                </span>
                <span>
                  <span className="block font-medium text-ink">Office</span>
                  <span className="text-ink-muted">Colombo 03, Sri Lanka</span>
                </span>
              </li>
            </ul>
          </div>

          <div className="surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">Response times</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              <li className="flex items-center justify-between gap-3">
                <span>General enquiries</span>
                <span className="badge badge-success">1 working day</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Employer support</span>
                <span className="badge badge-success">Same day</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Report a listing</span>
                <span className="badge badge-warning">2 hours</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </Page>
  );
}
