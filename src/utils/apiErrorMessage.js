/** Return text only: API/hosting error payloads may contain nested objects. */
export function apiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const text = (value) => typeof value === "string" && value.trim() ? value : null;
  const data = error?.response?.data;
  const first = Array.isArray(data?.errors) ? data.errors[0] : null;
  const message = text(data) || text(data?.message) || text(data?.error) ||
    text(data?.error?.message) || text(first) || text(first?.message) || text(first?.msg);
  if (message) return message;
  if (error?.code === "ECONNABORTED") return "The server took too long to respond. Please try again.";
  if (error?.message === "Network Error") return "Cannot reach the server. Check that the API is running.";
  return text(fallback) || "Something went wrong. Please try again.";
}
