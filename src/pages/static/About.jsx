import { Link } from "react-router-dom";

import Page from "../../components/layout/Page.jsx";
import { Reveal } from "../../components/brand/useReveal.jsx";
import TiltCard from "../../components/brand/TiltCard.jsx";
import Icon from "../../components/ui/Icon.jsx";
import CountUp from "../../components/ui/CountUp.jsx";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { useReference } from "../../context/ReferenceContext.jsx";
import { jobsApi } from "../../api.js";

const VALUES = [
  {
    icon: "target",
    title: "One platform, three sides",
    copy: "Job seekers, employers and the regulator share the same data model — so a role posted once is visible to the right people instantly.",
  },
  {
    icon: "shield",
    title: "Verified employers",
    copy: "Every company profile is reviewed by an administrator before it can publish vacancies. Scam listings do not reach the feed.",
  },
  {
    icon: "mapPin",
    title: "Every district",
    copy: "Colombo, Jaffna, Matara, Batticaloa and 21 more. Search by district so local opportunities surface first.",
  },
  {
    icon: "zap",
    title: "Built for speed",
    copy: "Post a vacancy in a couple of minutes, review applicants in one screen and shortlist with a single click.",
  },
];

const STEPS = [
  { icon: "search", title: "Search", copy: "Filter by keyword, category, district, salary, work mode and experience." },
  { icon: "fileText", title: "Apply", copy: "Attach an uploaded CV and add a short note for the hiring team." },
  { icon: "users", title: "Get shortlisted", copy: "Employers review applications and move candidates through shortlist, interview and offer." },
];

export default function About() {
  useDocumentTitle("About us");
  const { districtNames, categoryNames } = useReference();

  // The live number of published roles, straight from the catalogue.
  const { data } = useFetch(() => jobsApi.list({ limit: 1 }), []);
  const listedRoles = data?.meta?.total ?? 0;

  return (
    <Page>
      <section className="aurora-bg relative">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="badge badge-accent">About us</span>
            <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              Building Sri Lanka&apos;s <span className="shimmer-text">fairest</span> job market
            </h1>
            <p className="mt-5 text-pretty text-base text-ink-2 sm:text-lg">
              Jobelza connects talented people with employers across the island. We make hiring transparent,
              fast and accessible — from a first job in Jaffna to a senior role in Colombo.
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-label="Platform numbers" className="mt-12">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Districts covered", value: districtNames.length, icon: "mapPin" },
              { label: "Job categories", value: categoryNames.length, icon: "layers" },
              { label: "Roles listed", value: listedRoles, icon: "briefcase" },
            ].map((stat) => (
              <TiltCard key={stat.label} className="card-3d card-glow p-6 text-center" max={7}>
                <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-500 to-violet-glow text-white shadow-e2">
                  <Icon name={stat.icon} size={22} />
                </span>
                <p className="mt-4 font-display text-3xl font-bold text-ink">
                  <CountUp value={stat.value} />
                </p>
                <p className="mt-1 text-sm text-ink-muted">{stat.label}</p>
              </TiltCard>
            ))}
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="values-heading" className="mt-20">
        <Reveal>
          <h2 id="values-heading" className="font-display text-3xl font-bold tracking-tight text-ink">
            What we stand for
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 100}>
              <TiltCard className="card-3d card-glow h-full p-6" max={7}>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                  <Icon name={value.icon} size={20} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{value.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{value.copy}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="process-heading" className="mt-20">
        <Reveal>
          <h2 id="process-heading" className="font-display text-3xl font-bold tracking-tight text-ink">
            How hiring works here
          </h2>
        </Reveal>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 110} as="li">
              <TiltCard className="card-3d card-glow h-full p-6" max={7}>
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-aurora-600 dark:text-aurora-300">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{step.copy}</p>
              </TiltCard>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="mt-20">
        <Reveal>
          <div className="glass-panel rounded-3xl p-8 sm:p-12">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Join the platform</h2>
            <p className="mt-3 max-w-xl text-pretty text-ink-muted">
              Whether you are hiring or looking, it takes less than five minutes to get started.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register" className="btn btn-primary">
                Create an account
                <Icon name="arrowRight" size={16} />
              </Link>
              <Link to="/jobs" className="btn btn-secondary">
                Browse jobs
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </Page>
  );
}
