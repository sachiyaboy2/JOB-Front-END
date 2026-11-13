import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, apiErrorMessage, clearSession, getStoredUser, getToken, storeSession } from "../api.js";

const AuthContext = createContext(null);

function homePathFor(role) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "employer") return "/employer/dashboard";
  if (role === "seeker") return "/seeker/dashboard";
  return "/";
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [booting, setBooting] = useState(() => Boolean(getToken()));

  /* ---- Restore the session on a hard refresh ---------------------------- */
  useEffect(() => {
    let cancelled = false;
    const stored = getToken();
    if (!stored) {
      setBooting(false);
      return undefined;
    }

    authApi
      .me()
      .then((payload) => {
        if (cancelled) return;
        const nextUser = payload?.user || payload;
        if (nextUser) {
          setUser(nextUser);
          storeSession(stored, nextUser);
        }
      })
      .catch(() => {
        if (cancelled) return;
        // The API may simply be down — keep the cached user so the UI still
        // renders, but drop the token if the server rejected it.
        clearSession();
        setToken("");
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- The axios interceptor fires this event on a 401 ----------------- */
  useEffect(() => {
    const onUnauthorized = () => {
      setToken("");
      setUser(null);
    };
    window.addEventListener("ob:unauthorized", onUnauthorized);
    return () => window.removeEventListener("ob:unauthorized", onUnauthorized);
  }, []);

  const persist = useCallback((payload) => {
    const nextToken = payload?.token || payload?.accessToken || "";
    const nextUser = payload?.user || null;
    storeSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const login = useCallback(
    async (email, password) => {
      const payload = await authApi.login({ email, password });
      const nextUser = persist(payload);
      return nextUser;
    },
    [persist],
  );

  const register = useCallback(
    async (values) => {
      const payload = await authApi.register(values);
      const nextUser = persist(payload);
      return nextUser;
    },
    [persist],
  );

  const logout = useCallback(() => {
    clearSession();
    setToken("");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const payload = await authApi.me();
    const nextUser = payload?.user || payload;
    if (nextUser) {
      setUser(nextUser);
      storeSession(getToken(), nextUser);
    }
    return nextUser;
  }, []);

  const role = user?.role || null;

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      booting,
      isAuthenticated: Boolean(token),
      isSeeker: role === "seeker",
      isEmployer: role === "employer",
      isAdmin: role === "admin",
      login,
      register,
      logout,
      refreshUser,
      homePathForRole: homePathFor,
    }),
    [user, token, role, booting, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

export { homePathFor };
export default AuthProvider;
