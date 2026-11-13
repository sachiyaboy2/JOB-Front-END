import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";
import Icon from "../ui/Icon.jsx";
import { ThemeToggle } from "../brand/ThemeToggle.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useDismissable } from "../../utils/hooks.js";

const PUBLIC_LINKS = [
  { to: "/jobs", label: "Find jobs" },
  { to: "/companies", label: "Companies" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function roleLinks(role) {
  if (role === "seeker") {
    return [
      { to: "/seeker/dashboard", label: "Dashboard" },
      { to: "/seeker/applications", label: "Applications" },
      { to: "/seeker/saved-jobs", label: "Saved jobs" },
      { to: "/seeker/cv", label: "My CV" },
      { to: "/seeker/profile", label: "Profile" },
    ];
  }
  if (role === "employer") {
    return [
      { to: "/employer/dashboard", label: "Dashboard" },
      { to: "/employer/jobs", label: "My jobs" },
      { to: "/employer/applicants", label: "Applicants" },
      { to: "/employer/company", label: "Company" },
    ];
  }
  if (role === "admin") {
    return [
      { to: "/admin/dashboard", label: "Overview" },
      { to: "/admin/approvals", label: "Approvals" },
      { to: "/admin/jobs", label: "Jobs" },
      { to: "/admin/users", label: "Users" },
    ];
  }
  return [];
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const menuRef = useDismissable(menuOpen, closeMenu);
  const drawerRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close every transient surface when the route changes.
  useEffect(() => {
    setDrawerOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // The drawer is modal on small screens: lock scroll and close on Escape.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => {
      const node = drawerRef.current?.querySelector("a, button");
      node?.focus();
    }, 40);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [drawerOpen]);

  const links = roleLinks(role);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-line/70 shadow-e2" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <BrandMark />

        <nav aria-label="Main" className="ml-6 hidden items-center gap-0.5 lg:flex">
          {PUBLIC_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
          {links.slice(0, 2).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative hidden lg:block" ref={menuRef}>
              <button
                type="button"
                ref={menuButtonRef}
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="btn btn-ghost !px-2.5 !py-1.5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-aurora-500 to-violet-glow text-xs font-bold text-white">
                  {(user?.name || "U").slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-28 truncate text-sm font-medium">{user?.name || "Account"}</span>
                <Icon name="chevronDown" size={14} />
              </button>

              {menuOpen ? (
                <div
                  role="menu"
                  aria-label="Account menu"
                  className="pop-in surface-elevated absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden p-1.5"
                >
                  <div className="border-b border-line px-3 py-2">
                    <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                    <p className="truncate text-xs text-ink-muted">{user?.email}</p>
                    <span className="badge badge-accent mt-2 capitalize">{role}</span>
                  </div>
                  {links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      role="menuitem"
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
                    >
                      <Icon name="chevronRight" size={14} className="opacity-50" />
                      {link.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger/10"
                  >
                    <Icon name="logOut" size={15} />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </div>
          )}

          <button
            type="button"
            className="btn btn-ghost !px-2.5 lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
          >
            <Icon name="menu" size={20} />
          </button>
        </div>
      </div>

      {/* ---- Mobile drawer ------------------------------------------------ */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="surface-elevated absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col rounded-l-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
              <BrandMark />
              <button
                type="button"
                className="btn btn-ghost !px-2"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
              >
                <Icon name="x" size={19} />
              </button>
            </div>

            <nav aria-label="Mobile" className="scroll-slim flex-1 overflow-y-auto px-3 py-4">
              <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Browse</p>
              {PUBLIC_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-aurora-500/10 text-aurora-600 dark:text-aurora-300" : "text-ink-2 hover:bg-surface-2"
                    }`
                  }
                >
                  <Icon name="chevronRight" size={15} className="opacity-50" />
                  {link.label}
                </NavLink>
              ))}

              {links.length ? (
                <>
                  <p className="px-2 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    My account
                  </p>
                  {links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive ? "bg-aurora-500/10 text-aurora-600 dark:text-aurora-300" : "text-ink-2 hover:bg-surface-2"
                        }`
                      }
                    >
                      <Icon name="chevronRight" size={15} className="opacity-50" />
                      {link.label}
                    </NavLink>
                  ))}
                </>
              ) : null}
            </nav>

            <div className="border-t border-line p-4">
              {isAuthenticated ? (
                <button type="button" onClick={handleLogout} className="btn btn-danger w-full">
                  <Icon name="logOut" size={16} />
                  Sign out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" className="btn btn-secondary">
                    Sign in
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Header;
