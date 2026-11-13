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
import { USER_ROLES } from "../../utils/constants.js";

export default function AdminUsers() {
  useDocumentTitle("Users");

  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [busyId, setBusyId] = useState(null);

  const debounced = useDebounce(keyword, 400);
  const query = useMemo(
    () => ({ q: debounced, ...(roleFilter ? { role: roleFilter } : {}), limit: 50 }),
    [debounced, roleFilter],
  );

  const { data, loading, error, reload } = useFetch(() => adminApi.users(query), [query]);
  const users = toArray(data);

  const update = async (user, payload, message) => {
    const id = user._id || user.id;
    setBusyId(String(id));
    try {
      await adminApi.updateUser(id, payload);
      toast.success(message);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The user could not be updated."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Users</h1>
        <p className="mt-2 text-ink-muted">
          Manage every account — suspend a user, restore one, or change a role.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="admin-users-search" className="sr-only">
            Search users
          </label>
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
            <Icon name="search" size={17} />
          </span>
          <input
            id="admin-users-search"
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search by name or email"
            className="field !pl-10"
          />
        </div>
        <div>
          <label htmlFor="admin-users-role" className="sr-only">
            Filter by role
          </label>
          <select
            id="admin-users-role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="field !w-auto"
          >
            <option value="">All roles</option>
            {USER_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <TableSkeleton rows={6} />
        ) : error ? (
          <ErrorState
            title="We could not load the user list"
            message={apiErrorMessage(error, "The admin service is not responding.")}
            onRetry={reload}
          />
        ) : users.length === 0 ? (
          <EmptyState icon="users" title="No users found" message="Try a different search term or role." />
        ) : (
          <div className="table-shell overflow-x-auto">
            <table>
              <caption className="sr-only">All registered users</caption>
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const id = user._id || user.id;
                  const suspended = user.isSuspended === true;
                  return (
                    <tr key={id}>
                      <td>
                        <span className="font-medium text-ink">{user.name || "Unknown"}</span>
                        <span className="block text-xs text-ink-muted">{user.email}</span>
                      </td>
                      <td>
                        <label htmlFor={`role-${id}`} className="sr-only">
                          Role for {user.name}
                        </label>
                        <select
                          id={`role-${id}`}
                          value={user.role || "seeker"}
                          onChange={(event) =>
                            update(user, { role: event.target.value }, "Role updated")
                          }
                          disabled={busyId === String(id)}
                          className="field !w-auto !py-1.5 !text-xs capitalize"
                        >
                          {USER_ROLES.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="whitespace-nowrap text-ink-muted">{formatDate(user.createdAt)}</td>
                      <td>
                        <StatusBadge status={suspended ? "suspended" : "active"} size="sm" />
                      </td>
                      <td className="text-right">
                        {suspended ? (
                          <button
                            type="button"
                            className="btn btn-secondary !px-2.5 !py-1.5 text-xs"
                            onClick={() => update(user, { suspended: false }, "User restored")}
                            disabled={busyId === String(id)}
                          >
                            <Icon name="refresh" size={14} />
                            Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-danger !px-2.5 !py-1.5 text-xs"
                            onClick={() => update(user, { suspended: true }, "User suspended")}
                            disabled={busyId === String(id)}
                          >
                            <Icon name="ban" size={14} />
                            Suspend
                          </button>
                        )}
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
