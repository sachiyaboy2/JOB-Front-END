import { Link } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";
import Icon from "../ui/Icon.jsx";
import { FALLBACK_CATEGORIES } from "../../utils/constants.js";

const COLUMNS = [
  {
    title: "For job seekers",
    links: [
      { to: "/jobs", label: "Browse jobs" },
      { to: "/seeker/dashboard", label: "My dashboard" },
      { to: "/seeker/applications", label: "Applications" },
      { to: "/seeker/saved-jobs", label: "Saved jobs" },
      { to: "/seeker/cv", label: "Upload CV" },
    ],
  },
  {
    title: "For employers",
    links: [
      { to: "/employer/dashboard", label: "Employer dashboard" },
      { to: "/employer/jobs/new", label: "Post a job" },
      { to: "/employer/applicants", label: "Review applicants" },
      { to: "/employer/company", label: "Company profile" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About us" },
      { to: "/companies", label: "Company directory" },
      { to: "/contact", label: "Contact" },
      { to: "/faq", label: "FAQ" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-line bg-surface-2/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BrandMark />
            <p className="mt-4 max-w-sm text-sm text-ink-muted">
              Connecting Sri Lankan talent with the country&apos;s best employers. Search jobs in every district,
              post vacancies in minutes and manage your whole hiring pipeline in one place.
            </p>
            <p className="mt-5 font-display text-lg font-bold text-ink">
              Your Skills. <span className="shimmer-text">Your Career. Your Future.</span>
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a href="https://facebook.com" className="btn btn-ghost !px-2.5" aria-label="Jobelza on Facebook" rel="noreferrer" target="_blank">
                <Icon name="facebook" size={18} />
              </a>
              <a href="https://linkedin.com" className="btn btn-ghost !px-2.5" aria-label="Jobelza on LinkedIn" rel="noreferrer" target="_blank">
                <Icon name="linkedin" size={18} />
              </a>
              <a href="mailto:hello@jobportal.lk" className="btn btn-ghost !px-2.5" aria-label="Email Jobelza">
                <Icon name="mail" size={18} />
              </a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink">{column.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-muted transition-colors hover:text-aurora-600 dark:hover:text-aurora-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-line pt-6">
          <h2 className="sr-only">Popular categories</h2>
          <ul className="flex flex-wrap gap-2">
            {FALLBACK_CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  to={`/jobs?category=${encodeURIComponent(category)}`}
                  className="badge transition-colors hover:border-aurora-400 hover:text-aurora-600 dark:hover:text-aurora-300"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-ink-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Jobelza Sri Lanka. All rights reserved.</p>
          <p>Built for Sri Lanka&apos;s workforce · 25 districts</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
