import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { referenceApi } from "../api.js";
import { FALLBACK_CATEGORIES, FALLBACK_DISTRICTS } from "../utils/constants.js";

/**
 * Job categories and districts, loaded once and shared by every filter.
 *
 * When the API is unreachable the built-in fallback list keeps the pickers
 * usable — the page still renders and still filters.
 */
const ReferenceContext = createContext(null);

function normalise(payload, fallback) {
  const source = Array.isArray(payload)
    ? payload
    : payload?.data || payload?.categories || payload?.districts || [];

  const list = Array.isArray(source) ? source : [];

  if (!list.length) return fallback.map((name) => ({ id: name, name }));

  return list
    .map((item) => {
      if (typeof item === "string") return { id: item, name: item };
      if (!item || typeof item !== "object") return null;
      const name = item.name || item.title || item.label || item.district || item.category;
      if (!name) return null;
      return { ...item, id: item._id || item.id || name, name };
    })
    .filter(Boolean);
}

export function ReferenceProvider({ children }) {
  const [categories, setCategories] = useState(() => FALLBACK_CATEGORIES.map((name) => ({ id: name, name })));
  const [districts, setDistricts] = useState(() => FALLBACK_DISTRICTS.map((name) => ({ id: name, name })));
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([referenceApi.categories(), referenceApi.districts()]).then(([catRes, distRes]) => {
      if (cancelled) return;
      const catOk = catRes.status === "fulfilled";
      const distOk = distRes.status === "fulfilled";
      if (catOk) setCategories(normalise(catRes.value, FALLBACK_CATEGORIES));
      if (distOk) setDistricts(normalise(distRes.value, FALLBACK_DISTRICTS));
      setDegraded(!(catOk && distOk));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      categories,
      districts,
      categoryNames: categories.map((c) => c.name),
      districtNames: districts.map((d) => d.name),
      degraded,
    }),
    [categories, districts, degraded],
  );

  return <ReferenceContext.Provider value={value}>{children}</ReferenceContext.Provider>;
}

export function useReference() {
  const context = useContext(ReferenceContext);
  if (!context) throw new Error("useReference must be used inside <ReferenceProvider>");
  return context;
}

export default ReferenceProvider;
