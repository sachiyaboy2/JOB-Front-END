import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuroraHero from "../../components/brand/AuroraHero.jsx";
import { Reveal } from "../../components/brand/useReveal.jsx";
import TiltCard from "../../components/brand/TiltCard.jsx";
import Icon from "../../components/ui/Icon.jsx";
import JobCard from "../../components/ui/JobCard.jsx";
import CompanyCard from "../../components/ui/CompanyCard.jsx";
import CountUp from "../../components/ui/CountUp.jsx";
import { JobCardSkeleton, Skeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useReference } from "../../context/ReferenceContext.jsx";
import { companiesApi, jobsApi } from "../../api.js";
import { useFetch } from "../../utils/hooks.js";
import { toArray } from "../../utils/data.js";
import { apiErrorMessage } from "../../api.js";

const STEPS = [
  {
    icon: "user",
    title: "Create your profile",
    copy: "Sign up as a job seeker in under a minute. Add your education, experience and skills so employers can find you.",
  },
  {
    icon: "search",
    title: "Search and match",
    copy: "Filter by category, district, salary, work mode and experience level — across every district in Sri Lanka.",
  },
  {
    icon: "send",
    title: "Apply and get hired",
    copy: "Apply with one tap, track every application, and speak to employers who shortlist you.",
  },
];

const CATEGORY_ICONS = {
  "information technology": "database",
  "finance & accounting": "wallet",
  "sales & marketing": "trendingUp",
  "human resources": "users",
  engineering: "settings",
  "healthcare & nursing": "heart",
  "hospitality & tourism": "home",
};

function categoryIcon(name) {
  return CATEGORY_ICONS[String(name).toLowerCase()] || "layers";
}

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { categories, districts } = useReference();

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");

  const featured = useFetch(() => jobsApi.featured(), []);
  const companies = useFetch(() => companiesApi.list({ limit: 6 }), []);
  const stats = useFetch(
    () => Promise.allSettled([jobsApi.list({ limit: 1 }), companiesApi.list({ limit: 1 })]),
    [],
  );

  const featuredJobs = toArray(featured.data);
  const companyList = toArray(companies.data);

  const counts = useMemo(() => {
    const [jobsResult, companiesResult] = stats.data || [];
    const jobTotal = jobsResult?.status === "fulfilled" ? jobsResult.value?.meta?.total ?? null : null;
    const companyTotal =
      companiesResult?.status === "fulfilled" ? companiesResult.value?.meta?.total ?? null : null;
    return {
      jobs: jobTotal,
      companies: companyTotal,
      districts: districts.length,
      categories: categories.length,
    };
  }, [stats.data, districts.length, categories.length]);

  const submitSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (category) params.set("category", category);
    if (district) params.set("district", district);
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const browseLink = (params) => {
    const search = new URLSearchParams(params);
    return `/jobs?${search.toString()}`;
  };

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="relative">
        <AuroraHero height="clamp(30rem, 72vh, 44rem)">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-16 pt-16 text-center sm:pb-20 sm:pt-24">
            <Reveal immediate>
              <span className="badge badge-accent gap-1.5 !px-3 !py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]">
                <Icon name="sparkles" size={13} />
                Sri Lanka&apos;s job marketplace
              </span>
            </Reveal>

            <Reveal immediate delay={90}>
              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Your Skills.
                <span className="shimmer-text block">Your Career. Your Future.</span>
              </h1>
            </Reveal>

            <Reveal immediate delay={180}>
              <p className="mt-5 max-w-2xl text-pretty text-base text-ink-2 sm:text-lg">
                Search thousands of openings across all 25 districts, apply in one tap, and let employers
                find you. One account for job seekers, employers and administrators.
              </p>
            </Reveal>

            <Reveal immediate delay={260}>
              <form
                onSubmit={submitSearch}
                role="search"
                aria-label="Search jobs"
                className="glass-panel mt-9 w-full max-w-3xl rounded-2xl p-3 sm:p-4"
              >
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <div className="relative">
                    <label htmlFor="home-keyword" className="sr-only">
                      Job title, keyword or company
                    </label>
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
                      <Icon name="search" size={17} />
                    </span>
                    <input
                      id="home-keyword"
                      type="search"
                      value={keyword}
                      onChange={(event) => setKeyword(event.target.value)}
                      placeholder="Job title, skill or company"
                      className="field !pl-10"
                    />
                  </div>

                  <div>
                    <label htmlFor="home-category" className="sr-only">
                      Category
                    </label>
                    <select
                      id="home-category"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="field"
                    >
                      <option value="">All categories</option>
                      {categories.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="home-district" className="sr-only">
                      District
                    </label>
                    <select
                      id="home-district"
                      value={district}
                      onChange={(event) => setDistrict(event.target.value)}
                      className="field"
                    >
                      <option value="">All districts</option>
                      {districts.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary h-full !px-6">
                    Search
                    <Icon name="arrowRight" size={16} />
                  </button>
                </div>
              </form>
            </Reveal>

            <Reveal immediate delay={340}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-medium text-ink-muted">Popular:</span>
                {categories.slice(0, 4).map((item) => (
                  <Link
                    key={item.id}
                    to={browseLink({ category: item.name })}
                    className="badge transition-colors hover:border-aurora-400 hover:text-aurora-600 dark:hover:text-aurora-300"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </Reveal>

            <Reveal immediate delay={400}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                {isAuthenticated ? (
                  <Link
                    to={
                      role === "admin"
                        ? "/admin/dashboard"
                        : role === "employer"
                          ? "/employer/dashboard"
                          : "/seeker/dashboard"
                    }
                    className="btn btn-primary"
                  >
                    Go to my dashboard
                    <Icon name="arrowRight" size={16} />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary">
                      Create free account
                      <Icon name="arrowRight" size={16} />
                    </Link>
                    <Link to="/jobs" className="btn btn-secondary">
                      Browse all jobs
                    </Link>
                  </>
                )}
              </div>
            </Reveal>
          </div>
        </AuroraHero>
      </section>

      {/* ================= STATS ================= */}
      <section aria-labelledby="stats-heading" className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 id="stats-heading" className="sr-only">
            Platform at a glance
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Open jobs", value: counts.jobs, icon: "briefcase", tone: "aurora", fallback: "—" },
              { label: "Hiring companies", value: counts.companies, icon: "building", tone: "cyan", fallback: "—" },
              { label: "Districts covered", value: counts.districts, icon: "mapPin", tone: "violet" },
              { label: "Job categories", value: counts.categories, icon: "layers", tone: "success" },
            ].map((stat, index) => (
              <TiltCard
                key={stat.label}
                className="card-3d card-glow p-5"
                max={6}
                data-delay={index * 90}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{stat.label}</p>
                    <p className="mt-2 font-display text-3xl font-bold text-ink">
                      {stat.value === null || stat.value === undefined ? (
                        <span className="text-ink-muted">{stat.fallback || "—"}</span>
                      ) : (
                        <CountUp value={stat.value} />
                      )}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-e2 ${
                      {
                        aurora: "from-aurora-500 to-violet-glow",
                        cyan: "from-cyan-glow to-aurora-500",
                        violet: "from-violet-glow to-aurora-600",
                        success: "from-success to-cyan-glow",
                      }[stat.tone]
                    }`}
                  >
                    <Icon name={stat.icon} size={20} />
                  </span>
                </div>
              </TiltCard>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section aria-labelledby="how-heading" className="mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge badge-accent">How it works</span>
            <h2 id="how-heading" className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Three steps from profile to offer
            </h2>
            <p className="mt-3 text-pretty text-ink-muted">
              Whether you are hunting for your first job or your next hire, the flow is the same — simple, fast
              and transparent.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 120}>
              <TiltCard className="card-3d card-glow h-full p-6" max={7}>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-500 to-violet-glow text-white shadow-e2">
                  <Icon name={step.icon} size={22} />
                </span>
                <p className="mt-5 font-mono text-xs font-semibold uppercase tracking-widest text-aurora-600 dark:text-aurora-300">
                  Step {index + 1}
                </p>
                <h3 className="mt-1.5 font-display text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{step.copy}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= FEATURED JOBS ================= */}
      <section aria-labelledby="featured-heading" className="mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="badge badge-accent">Featured</span>
              <h2 id="featured-heading" className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Hand-picked openings
              </h2>
              <p className="mt-2 text-ink-muted">Roles employers have highlighted this week.</p>
            </div>
            <Link to="/jobs" className="btn btn-secondary">
              View all jobs
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </Reveal>

        <div className="mt-9">
          {featured.loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <JobCardSkeleton key={index} />
              ))}
            </div>
          ) : featured.error ? (
            <ErrorState
              title="Featured jobs are unavailable"
              message={apiErrorMessage(featured.error, "We could not reach the jobs service.")}
              onRetry={featured.reload}
            />
          ) : featuredJobs.length === 0 ? (
            <EmptyState
              icon="briefcase"
              title="No featured jobs yet"
              message="Check back soon — new openings are posted every day."
              action={
                <Link to="/jobs" className="btn btn-primary">
                  Browse all jobs
                </Link>
              }
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredJobs.slice(0, 6).map((job, index) => (
                <Reveal key={job._id || job.id || index} delay={index * 90}>
                  <JobCard job={job} index={index} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section aria-labelledby="categories-heading" className="mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="badge badge-accent">Categories</span>
            <h2 id="categories-heading" className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Browse by field of work
            </h2>
          </div>
        </Reveal>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((item, index) => (
            <Reveal key={item.id} delay={index * 80}>
              <TiltCard className="card-3d card-glow h-full" max={8}>
                <Link
                  to={browseLink({ category: item.name })}
                  className="group flex items-center gap-4 p-5"
                >
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-aurora-500/12 text-aurora-600 transition-transform duration-300 group-hover:scale-110 dark:text-aurora-300">
                    <Icon name={categoryIcon(item.name)} size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-semibold text-ink">{item.name}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">View openings</span>
                  </span>
                  <Icon
                    name="chevronRight"
                    size={18}
                    className="text-ink-muted transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= TOP COMPANIES ================= */}
      <section aria-labelledby="companies-heading" className="mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="badge badge-accent">Employers</span>
              <h2 id="companies-heading" className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Top companies hiring
              </h2>
            </div>
            <Link to="/companies" className="btn btn-secondary">
              Company directory
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </Reveal>

        <div className="mt-9">
          {companies.loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="surface p-5">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-16 w-16 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-3 w-full" />
                </div>
              ))}
            </div>
          ) : companies.error ? (
            <ErrorState
              title="Company directory is unavailable"
              message={apiErrorMessage(companies.error, "We could not reach the companies service.")}
              onRetry={companies.reload}
            />
          ) : companyList.length === 0 ? (
            <EmptyState icon="building" title="No companies listed yet" message="Employer profiles will appear here." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {companyList.slice(0, 6).map((company, index) => (
                <Reveal key={company._id || company.id || index} delay={index * 90}>
                  <CompanyCard company={company} index={index} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-4 pt-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="glass-panel relative overflow-hidden rounded-3xl p-8 sm:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-aurora-500/25 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-cyan-glow/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  Ready to move forward?
                </h2>
                <p className="mt-3 max-w-lg text-pretty text-ink-muted">
                  Whether you are looking for your next role or your next team member, one account gets you
                  there faster.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link to="/register?role=seeker" className="btn btn-primary">
                  I am looking for a job
                  <Icon name="arrowRight" size={16} />
                </Link>
                <Link to="/register?role=employer" className="btn btn-secondary">
                  I am hiring
                  <Icon name="building" size={16} />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
