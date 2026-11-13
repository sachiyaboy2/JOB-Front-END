/**
 * Response shape helpers.
 *
 * The API may answer with a bare array, `{ data: [...] }` or `{ data: {...} }`.
 * These helpers keep every page free of defensive `Array.isArray` noise.
 */

export function toArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  if (payload.data && typeof payload.data === "object") return [payload.data];
  if (payload.jobs) return payload.jobs;
  if (payload.companies) return payload.companies;
  if (payload.applications) return payload.applications;
  if (payload.cv) return payload.cv;
  if (payload.cvs) return payload.cvs;
  return [];
}

/** Pull a single entity out of a list or a wrapper object. */
export function toEntity(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (payload.data && !Array.isArray(payload.data)) return payload.data;
  if (payload.job) return payload.job;
  if (payload.company) return payload.company;
  if (payload.application) return payload.application;
  if (payload.user) return payload.user;
  return payload;
}

/** Pagination meta with sane defaults when the API omits it. */
export function readMeta(payload, meta, fallbackTotal = 0) {
  const source = meta || payload?.meta || payload?.pagination || payload?.pageInfo || {};
  const total =
    source.total ?? source.totalCount ?? source.totalJobs ?? source.count ?? fallbackTotal;
  const totalPages =
    source.pages ?? source.totalPages ?? source.pageCount ?? Math.max(1, Math.ceil((total || 0) / 12));
  return {
    total: Number(total) || 0,
    pages: Number(totalPages) || 1,
    page: Number(source.page ?? source.currentPage ?? 1) || 1,
    limit: Number(source.limit ?? source.perPage ?? 12) || 12,
  };
}

/** Names of a reference list returned as `["a","b"]` or `[{name:"a"}]`. */
export function namesOf(payload) {
  return toArray(payload)
    .map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return null;
      return item.name || item.title || item.label || null;
    })
    .filter(Boolean);
}
