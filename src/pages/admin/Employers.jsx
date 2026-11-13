import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import StatusBadge from "../../components/ui/StatusBadge.jsx";
import { TableSkeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { apiErrorMessage, adminApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDebounce, useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { formatDate } from "../../utils/format.js";

/**
 * All employers on the platform.
 *
 * The API lists employer accounts through GET /api/admin/users?role=employer
 * and verifies them through PATCH /api/admin/employers/:id/verify.
 */
export default function AdminEmployers() {
  useDocumentTitle("Employers");

  const [keyword, setKeyword] = useState("");
  const [busyId, setBusyId] = useState(null);

  const debounced = useDebounce(keyword, 400);
  const query = useMemo(() => ({ q: debounced, role: "employer", limit: 50 }), [debounced]);

  const { data, loading, error, reload } = useFetch(() => adminApi.employers(query), [query]);
  const employers = toArray(data);

  const verify = async (employer, verified) => {
    const id = employer.id || employer._id;
    setBusyId(String(id));
    try {
      await adminApi.verifyEmployer(id, { verified });
      toast.success(verified ? "Employer verified" : "Verification removed");
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The employer could not be updated."));
    } finally {
      setBusyId(null);
    }
  };

  const suspend = async (employer) => {
    const id = employer.id || employer._id;
    setBusyId(String(id));
    try {
      await adminApi.updateUser(id, { suspended: true });
      toast.success("Employer suspended");
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The employer could not be suspended."));
    } finally {
      setBusyId(null);
    }
  };

  const restore = async (employer) => {
    const id = employer.id || employer._id;
    setBusyId(String(id));
    try {
      await adminApi.updateUser(id, { suspended: false });
      toast.success("Employer restored");
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The employer could not be restored."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Employers</h1>
        <p className="mt-2 text-ink-muted">Verify, suspend and review every employer account.</p>
      </header>

      <div className="relative max-w-xl">
        <label htmlFor="admin-employers-search" className="sr-only">
          Search employers
        </label>
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
          <Icon name="search" size={17} />
        </span>
        <input
          id="admin-employers-search"
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search by name or email"
          className="field !pl-10"
        />
      </div>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : error ? (
          <ErrorState
            title="We could not load the employer list"
            message={apiErrorMessage(error, "The admin service is not responding.")}
            onRetry={reload}
          />
        ) : employers.length === 0 ? (
          <EmptyState icon="building" title="No employers found" message="Try a different search term." />
        ) : (
          <div className="table-shell overflow-x-auto">
            <table>
              <caption className="sr-only">Employer accounts registered on the platform</caption>
              <thead>
                <tr>
                  <th scope="col">Employer</th>
                  <th scope="col">District</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {employers.map((employer) => {
                  const id = employer.id || employer._id;
                  const suspended = employer.isSuspended === true;
                  const verified = employer.isVerified === true;
                  return (
                    <tr key={id}>
                      <td>
                        <span className="font-medium text-ink">{employer.name || "Employer"}</span>
                        <span className="block text-xs text-ink-muted">{employer.email || ""}</span>
                      </td>
                      <td className="text-ink-muted">{employer.district || "—"}</td>
                      <td className="whitespace-nowrap text-ink-muted">{formatDate(employer.createdAt)}</td>
                      <td>
                        <div className="flex flex-wrap gap-1.5">
                          <StatusBadge status={suspended ? "suspended" : verified ? "verified" : "pending"} size="sm" />
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center justify-end gap-1">
                          {!verified ? (
                            <button
                              type="button"
                              className="btn btn-secondary !px-2.5 !py-1.5 text-xs"
                              onClick={() => verify(employer, true)}
                              disabled={busyId === String(id)}
                            >
                              <Icon name="shield" size={14} />
                              Verify
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-ghost !px-2.5 !py-1.5 text-xs"
                              onClick={() => verify(employer, false)}
                              disabled={busyId === String(id)}
                            >
                              <Icon name="xCircle" size={14} />
                              Unverify
                            </button>
                          )}
                          {suspended ? (
                            <button
                              type="button"
                              className="btn btn-secondary !px-2.5 !py-1.5 text-xs"
                              onClick={() => restore(employer)}
                              disabled={busyId === String(id)}
                            >
                              <Icon name="refresh" size={14} />
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-danger !px-2.5 !py-1.5 text-xs"
                              onClick={() => suspend(employer)}
                              disabled={busyId === String(id)}
                            >
                              <Icon name="ban" size={14} />
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Page>
  );
}
