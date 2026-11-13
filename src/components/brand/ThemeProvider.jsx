import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Theme provider.
 *
 * - Toggles the `dark` class on <html>.
 * - Persists the choice in localStorage under "ob.theme".
 * - Falls back to the OS preference when the user has not chosen yet.
 *
 * Put the small inline script from DESIGN-SYSTEM.md in index.html so the class
 * is set before the first paint (no white flash).
 */

const STORAGE_KEY = "ob.theme";
const ThemeContext = createContext(null);

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Storage can be unavailable in private mode; fall through to the OS value.
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export function ThemeProvider({ children, defaultTheme }) {
  const [theme, setTheme] = useState(() => defaultTheme ?? readStoredTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore quota / private mode failures; the theme still applies for this session.
    }
  }, [theme]);

  // Follow the OS only while the user has not made an explicit choice.
  useEffect(() => {
    if (defaultTheme) return undefined;
    if (window.localStorage.getItem(STORAGE_KEY)) return undefined;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event) => setTheme(event.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [defaultTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark: theme === "dark" }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return context;
}

export default ThemeProvider;
