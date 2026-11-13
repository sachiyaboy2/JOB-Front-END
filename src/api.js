import axios from "axios";

/**
 * Single axios instance for the Job Portal API.
 *
 * - base URL comes from VITE_API_URL (defaults to the local dev API).
 * - request interceptor attaches the JWT stored in localStorage.
 * - response interceptor clears the session on 401 so the UI can bounce to login.
 *
 * Every helper below returns the axios promise, so callers can `.then()` /
 * `.catch()` or `await` them inside their own loading/error handling.
 */

export const API_URL = import.meta.env.VITE_API_URL || "/api";

export const TOKEN_KEY = "ob.token";
export const USER_KEY = "ob.user";

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function getStoredUser() {
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeSession(token, user) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable â€” the session simply won't persist across reloads */
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/*  Instance                                                                  */
/* -------------------------------------------------------------------------- */

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Session is gone or expired â€” drop it and let the router react.
      clearSession();
      window.dispatchEvent(new CustomEvent("ob:unauthorized"));
    }
    return Promise.reject(error);
  },
);

export { apiErrorMessage } from "./utils/apiErrorMessage.js";

/* -------------------------------------------------------------------------- */
/*  Auth                                                                      */
/* -------------------------------------------------------------------------- */
export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  Jobs                                                                      */
/* -------------------------------------------------------------------------- */
export const jobsApi = {
  list: (params = {}) => api.get("/jobs", { params }).then((r) => r.data),
  featured: () => api.get("/jobs/featured").then((r) => r.data),
  get: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
  saved: (params = {}) => api.get("/jobs/saved", { params }).then((r) => r.data),
  save: (id) => api.post(`/jobs/${id}/save`).then((r) => r.data),
  unsave: (id) => api.delete(`/jobs/${id}/save`).then((r) => r.data),
  mine: (params = {}) => api.get("/jobs/mine", { params }).then((r) => r.data),
  create: (payload) => api.post("/jobs", payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/jobs/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/jobs/${id}`).then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  Companies                                                                 */
/* -------------------------------------------------------------------------- */
export const companiesApi = {
  list: (params = {}) => api.get("/companies", { params }).then((r) => r.data),
  get: (id) => api.get(`/companies/${id}`).then((r) => r.data),
  /** The signed-in employer's own company, looked up by the id on the user. */
  mine: (id) => (id ? api.get(`/companies/${id}`).then((r) => r.data) : Promise.resolve(null)),
  updateMine: (payload) => api.patch("/companies/me", payload).then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  Applications                                                              */
/* -------------------------------------------------------------------------- */
export const applicationsApi = {
  create: (payload) => api.post("/applications", payload).then((r) => r.data),
  mine: (params = {}) => api.get("/applications/mine", { params }).then((r) => r.data),
  forJob: (jobId, params = {}) => api.get("/applications", { params: { ...params, jobId } }).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }).then((r) => r.data),
  withdraw: (id) => api.delete(`/applications/${id}`).then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  CV                                                                        */
/* -------------------------------------------------------------------------- */
export const cvApi = {
  upload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post("/cv", form, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data);
  },
  mine: () => api.get("/cv/mine").then((r) => r.data),
  remove: (id) => api.delete(`/cv/${id}`).then((r) => r.data),
  /**
   * CV files are behind the auth middleware, so they are fetched with the
   * bearer token and handed back as an object URL.
   */
  download: async (id, fileName = "cv") => {
    const response = await api.get(`/cv/${id}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

/* -------------------------------------------------------------------------- */
/*  Seeker profile                                                            */
/* -------------------------------------------------------------------------- */
export const profileApi = {
  /** GET /api/auth/me - the only profile read route in the contract. */
  me: () => api.get("/auth/me").then((r) => r.data),
  /**
   * The published contract has no profile-update route. The conventional
   * REST path is used so the page works as soon as the back end adds it.
   */
  update: (payload) => api.patch("/users/me", payload).then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  Reference data                                                            */
/* -------------------------------------------------------------------------- */
export const referenceApi = {
  categories: () => api.get("/categories").then((r) => r.data),
  districts: () => api.get("/districts").then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  Admin                                                                     */
/* -------------------------------------------------------------------------- */
export const adminApi = {
  overview: () => api.get("/admin/overview").then((r) => r.data),
  pendingJobs: () => api.get("/admin/pending-jobs").then((r) => r.data),
  pendingEmployers: () => api.get("/admin/pending-employers").then((r) => r.data),
  approveJob: (id) => api.post(`/admin/jobs/${id}/approve`).then((r) => r.data),
  rejectJob: (id, reason) =>
    api.post(`/admin/jobs/${id}/reject`, { reason }).then((r) => r.data),
  /** Take a published advert down â€” the API exposes this as a rejection. */
  takeDownJob: (id, reason) =>
    api
      .post(`/admin/jobs/${id}/reject`, { reason: reason || "Taken down by an administrator" })
      .then((r) => r.data),
  /** Full job list for moderation. */
  jobs: (params = {}) => api.get("/admin/jobs", { params }).then((r) => r.data),
  /** Employers are listed through the user list, filtered by role. */
  employers: (params = {}) =>
    api.get("/admin/users", { params: { ...params, role: "employer" } }).then((r) => r.data),
  verifyEmployer: (id, payload = {}) => api.patch(`/admin/employers/${id}/verify`, payload).then((r) => r.data),
  users: (params = {}) => api.get("/admin/users", { params }).then((r) => r.data),
  updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload).then((r) => r.data),
  categories: (params = {}) => api.get("/admin/categories", { params }).then((r) => r.data),
  createCategory: (payload) => api.post("/admin/categories", payload).then((r) => r.data),
  updateCategory: (id, payload) => api.patch(`/admin/categories/${id}`, payload).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data),
  districts: (params = {}) => api.get("/admin/districts", { params }).then((r) => r.data),
  createDistrict: (payload) => api.post("/admin/districts", payload).then((r) => r.data),
  updateDistrict: (id, payload) => api.patch(`/admin/districts/${id}`, payload).then((r) => r.data),
  deleteDistrict: (id) => api.delete(`/admin/districts/${id}`).then((r) => r.data),
};

/* -------------------------------------------------------------------------- */
/*  Misc                                                                      */
/* -------------------------------------------------------------------------- */
export const contactApi = {
  send: (payload) => api.post("/contact", payload).then((r) => r.data),
};

export const notificationsApi = {
  list: (params = {}) => api.get("/notifications", { params }).then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post("/notifications/read-all").then((r) => r.data),
};

export default api;
