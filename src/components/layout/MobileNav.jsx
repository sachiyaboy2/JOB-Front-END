import { NavLink } from "react-router-dom";
import Icon from "../ui/Icon.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Mobile bottom navigation. Only shown on small screens.
 * The items change with the signed-in role.
 */
export function MobileNav() {
  const { isAuthenticated, role } = useAuth();

  const items = isAuthenticated
    ? role === "admin"
      ? [
          { to: "/admin/dashboard", label: "Home", icon: "home" },
          { to: "/admin/approvals", label: "Approvals", icon: "checkCircle" },
          { to: "/admin/jobs", label: "Jobs", icon: "briefcase" },
          { to: "/admin/users", label: "Users", icon: "users" },
        ]
      : role === "employer"
        ? [
            { to: "/employer/dashboard", label: "Home", icon: "home" },
            { to: "/employer/jobs", label: "Jobs", icon: "briefcase" },
            { to: "/employer/applicants", label: "Applicants", icon: "users" },
            { to: "/employer/company", label: "Company", icon: "building" },
          ]
        : [
            { to: "/seeker/dashboard", label: "Home", icon: "home" },
            { to: "/jobs", label: "Jobs", icon: "search" },
            { to: "/seeker/applications", label: "Applied", icon: "fileText" },
            { to: "/seeker/profile", label: "Profile", icon: "user" },
          ]
    : [
        { to: "/", label: "Home", icon: "home" },
        { to: "/jobs", label: "Jobs", icon: "search" },
        { to: "/companies", label: "Companies", icon: "building" },
        { to: "/login", label: "Sign in", icon: "key" },
      ];

  return (
    <nav
      aria-label="Quick navigation"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line/70 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? "text-aurora-600 dark:text-aurora-300" : "text-ink-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`inline-flex h-8 w-12 items-center justify-center rounded-lg transition-transform duration-300 ${
                      isActive ? "scale-110 bg-aurora-500/12" : ""
                    }`}
                  >
                    <Icon name={item.icon} size={19} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default MobileNav;
