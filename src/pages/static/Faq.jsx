import { useState } from "react";
import { Link } from "react-router-dom";

import Page from "../../components/layout/Page.jsx";
import { Reveal } from "../../components/brand/useReveal.jsx";
import Icon from "../../components/ui/Icon.jsx";
import { useDocumentTitle } from "../../utils/hooks.js";

const GROUPS = [
  {
    title: "Finding work",
    icon: "search",
    items: [
      {
        q: "How do I search for jobs on the portal?",
        a: "Use the search bar on the home page or the filters on the Browse jobs page. You can narrow results by keyword, category, district, salary range, employment type, work mode, experience level and education level, then sort by newest or salary.",
      },
      {
        q: "Which districts are covered?",
        a: "All 25 districts of Sri Lanka are supported. Pick a district in the filter panel to see only the vacancies in that area.",
      },
      {
        q: "Can I save jobs to come back to later?",
        a: "Yes. Sign in as a job seeker and use the bookmark icon on any job card. Saved jobs stay in your Saved jobs list until you remove them.",
      },
      {
        q: "What file types can I upload as a CV?",
        a: "PDF, DOC and DOCX files up to 5MB. You can upload several CVs and pick the right one when you apply.",
      },
    ],
  },
  {
    title: "Applying",
    icon: "send",
    items: [
      {
        q: "How do I apply for a job?",
        a: "Open the job posting and choose Apply now. Pick one of your uploaded CVs, add an optional cover letter and send. You will see the application on your dashboard straight away.",
      },
      {
        q: "Can I withdraw an application?",
        a: "Yes. Open the Applications page in your dashboard and use Withdraw on the application you want to withdraw.",
      },
      {
        q: "What happens after I apply?",
        a: "The employer reviews your CV and moves you through shortlist, interview and offer stages. The status of every application is shown on your dashboard.",
      },
    ],
  },
  {
    title: "For employers",
    icon: "building",
    items: [
      {
        q: "How do I post a vacancy?",
        a: "Create an employer account, complete your company profile, then use Post a job. You can save a draft or submit the advert for administrator approval.",
      },
      {
        q: "Why is my job advert pending?",
        a: "Every advert is reviewed by an administrator before it goes live. Pending adverts appear in your job list with a Pending badge and turn Approved once reviewed.",
      },
      {
        q: "Can I manage applicants for a specific role?",
        a: "Open the Applicants page, choose one of your live roles and you can view each CV, shortlist a candidate, schedule an interview or reject an application.",
      },
    ],
  },
  {
    title: "Accounts and safety",
    icon: "shield",
    items: [
      {
        q: "How do I switch between light and dark mode?",
        a: "Use the sun and moon button in the header. Your choice is saved on this device and applied before the next page loads, so there is never a flash of the wrong theme.",
      },
      {
        q: "My account was suspended — what now?",
        a: "Suspended accounts cannot post or apply. Contact support@jobportal.lk and an administrator will review the account.",
      },
      {
        q: "How do I reset my password?",
        a: "Use the Forgot password link on the sign-in page, or contact support if the reset email does not arrive.",
      },
    ],
  },
];

function Accordion({ item, id }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="surface overflow-hidden">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={`faq-panel-${id}`}
          id={`faq-button-${id}`}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className="font-display text-base font-semibold text-ink">{item.q}</span>
          <span
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-muted transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          >
            <Icon name="chevronDown" size={15} />
          </span>
        </button>
      </h3>
      <div
        id={`faq-panel-${id}`}
        role="region"
        aria-labelledby={`faq-button-${id}`}
        hidden={!open}
        className="border-t border-line px-5 py-4 text-sm leading-relaxed text-ink-2"
      >
        {item.a}
      </div>
    </div>
  );
}

export default function Faq() {
  useDocumentTitle("FAQ");

  let counter = 0;

  return (
    <Page>
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="badge badge-accent">Help centre</span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-pretty text-ink-muted">
            Everything you need to know about finding work, hiring and managing your account.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-10">
        {GROUPS.map((group, groupIndex) => (
          <section key={group.title} aria-labelledby={`faq-group-${groupIndex}`}>
            <Reveal>
              <h2
                id={`faq-group-${groupIndex}`}
                className="flex items-center gap-2.5 font-display text-xl font-semibold text-ink"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                  <Icon name={group.icon} size={17} />
                </span>
                {group.title}
              </h2>
            </Reveal>
            <div className="mt-4 space-y-3">
              {group.items.map((item) => {
                counter += 1;
                return (
                  <Reveal key={item.q} delay={groupIndex * 60}>
                    <Accordion item={item} id={counter} />
                  </Reveal>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <div className="glass-panel rounded-2xl p-6 text-center">
          <h2 className="font-display text-lg font-semibold text-ink">Still stuck?</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Our support team answers within one working day.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link to="/contact" className="btn btn-primary">
              Contact support
            </Link>
            <Link to="/jobs" className="btn btn-secondary">
              Browse jobs
            </Link>
          </div>
        </div>
      </div>
    </Page>
  );
}
