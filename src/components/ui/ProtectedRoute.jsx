import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Icon from "./Icon.jsx";

/**
 * Route guard.
 *
 * - No session  -> redirect to /login and remember where the user was going.
 * - Wrong role  -> redirect to that role's own home.
 */
export function ProtectedRoute({ roles = [], children }) {
  const { isAuthenticated, booting, role } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center" role="status" aria-live="polite">
        <span className="inline-flex items-center gap-3 text-sm text-ink-muted">
          <Icon name="loader" size={18} className="animate-spin" />
          Checking your session…
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (roles.length && !roles.includes(role)) {
    return <Navigate to={role === "admin" ? "/admin/dashboard" : role === "employer" ? "/employer/dashboard" : "/seeker/dashboard"} replace />;
  }

  return children;
}

export default ProtectedRoute;
