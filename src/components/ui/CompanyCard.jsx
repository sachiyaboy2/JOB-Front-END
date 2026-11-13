import { Link } from "react-router-dom";
import TiltCard from "../brand/TiltCard.jsx";
import Icon from "./Icon.jsx";
import { CompanyMark } from "./JobCard.jsx";
import { truncate } from "../../utils/format.js";

/**
 * Company directory card.
 */
export function CompanyCard({ company = {}, index = 0 }) {
  const id = company.id || company._id;
  const name = company.name || company.companyName || "Company";
  const industry = company.industry || null;
  const location = company.district || company.location || company.address || "Sri Lanka";
  const openJobs = company.openJobsCount ?? company.jobCount ?? company.jobsCount ?? null;
  const verified = company.isVerified === true || company.verified === true || company.status === "verified";

  return (
    <TiltCard className="card-3d card-glow h-full p-5" max={7} data-index={index}>
      <div className="flex items-start gap-3">
        <CompanyMark logo={company.logoUrl || company.logo} name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold leading-snug text-ink">
            <Link to={`/companies/${id}`} className="transition-colors after:absolute after:inset-0 hover:text-aurora-600 dark:hover:text-aurora-300">
              {name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-ink-muted">{industry || "Recruitment"}</p>
          {verified ? (
            <span className="badge badge-success mt-2">
              <Icon name="shield" size={12} /> Verified
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm text-ink-2">{truncate(company.description || "No description yet.", 190)}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="mapPin" size={13} /> {location}
        </span>
        {openJobs !== null ? (
          <span className="inline-flex items-center gap-1.5">
            <Icon name="briefcase" size={13} /> {openJobs} open {openJobs === 1 ? "role" : "roles"}
          </span>
        ) : null}
      </div>
    </TiltCard>
  );
}

export default CompanyCard;
