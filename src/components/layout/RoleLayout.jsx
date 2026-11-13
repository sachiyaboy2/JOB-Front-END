import { NavLink, Outlet, useLocation } from "react-router-dom";
import Icon from "../ui/Icon.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const NAV = {
  seeker: [
    { to: "/seeker/dashboard", label: "Dashboard", icon: "home" },
    { to: "/seeker/applications", label: "Applications", icon: "fileText" },
    { to: "/seeker/saved-jobs", label: "Saved jobs", icon: "bookmark" },
    { to: "/seeker/cv", label: "My CV", icon: "upload" },
    { to: "/seeker/profile", label: "Profile", icon: "user" },
  ],
  employer: [
    { to: "/employer/dashboard", label: "Dashboard", icon: "home" },
    { to: "/employer/jobs", label: "My jobs", icon: "briefcase" },
    { to: "/employer/applicants", label: "Applicants", icon: "users" },
    { to: "/employer/company", label: "Company profile", icon: "building" },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Overview", icon: "chart" },
    { to: "/admin/approvals", label: "Approvals", icon: "checkCircle" },
    { to: "/admin/jobs", label: "All jobs", icon: "briefcase" },
    { to: "/admin/employers", label: "Employers", icon: "building" },
    { to: "/admin/users", label: "Users", icon: "users" },
    { to: "/admin/categories", label: "Categories & districts", icon: "layers" },
  ],
};

const TITLES = {
  seeker: "Job seeker",
  employer: "Employer",
  admin: "Admin",
};

/**
 * Shell for the three role areas: a sidebar on desktop, a scrollable tab
 * strip on mobile, and the routed page on the right.
 */
export function RoleLayout() {
  const { role } = useAuth();
  const location = useLocation();
  const items = NAV[role] || [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="surface p-3">
            <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              {TITLES[role] || "Workspace"}
            </p>

            {/* Desktop vertical nav */}
            <nav aria-label={`${TITLES[role]} navigation`} className="hidden lg:block">
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-aurora-500/12 text-aurora-700 dark:text-aurora-300"
                            : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                        }`
                      }
                    >
                      <Icon name={item.icon} size={16} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile horizontal tabs */}
            <nav aria-label={`${TITLES[role]} navigation`} className="lg:hidden">
              <ul className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                {items.map((item) => (
                  <li key={item.to} className="shrink-0">
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-aurora-500 text-white shadow-e1"
                            : "bg-surface-2 text-ink-2 hover:bg-line"
                        }`
                      }
                    >
                      <Icon name={item.icon} size={14} />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <div key={location.pathname} className="page-enter min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default RoleLayout;
