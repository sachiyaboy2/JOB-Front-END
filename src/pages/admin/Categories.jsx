import { useState } from "react";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { apiErrorMessage, adminApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";

export default function AdminCategories() {
  useDocumentTitle("Categories & districts");

  const [tab, setTab] = useState("categories");

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Categories & districts</h1>
        <p className="mt-2 text-ink-muted">
          These lists drive every filter and dropdown across the portal.
        </p>
      </header>

      <div role="tablist" aria-label="Reference data" className="flex gap-2">
        {[
          { id: "categories", label: "Job categories", icon: "layers" },
          { id: "districts", label: "Districts", icon: "mapPin" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              tab === item.id ? "bg-aurora-500 text-white shadow-e1" : "bg-surface-2 text-ink-2 hover:bg-line"
            }`}
          >
            <Icon name={item.icon} size={15} />
            {item.label}
          </button>
        ))}
      </div>

      <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-6">
        {tab === "categories" ? (
          <ReferenceList
            key="categories"
            title="Job categories"
            icon="layers"
            singular="category"
            fetcher={() => adminApi.categories()}
            create={adminApi.createCategory}
            update={adminApi.updateCategory}
            remove={adminApi.deleteCategory}
          />
        ) : (
          <ReferenceList
            key="districts"
            title="Districts"
            icon="mapPin"
            singular="district"
            fetcher={() => adminApi.districts()}
            create={adminApi.createDistrict}
            update={adminApi.updateDistrict}
            remove={adminApi.deleteDistrict}
          />
        )}
      </div>
    </Page>
  );
}

/**
 * Shared list editor for the two reference tables.
 */
function ReferenceList({ title, icon, singular, fetcher, create, update, remove }) {
  const { data, loading, error, reload } = useFetch(fetcher, []);
  const items = toArray(data);

  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const add = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await create({ name: name.trim() });
      toast.success(`${singular[0].toUpperCase()}${singular.slice(1)} added`);
      setName("");
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, `The ${singular} could not be added.`));
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async (item) => {
    const id = item._id || item.id;
    setBusy(true);
    try {
      await update(id, { name: editName.trim() });
      toast.success("Saved");
      setEditing(null);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, `The ${singular} could not be saved.`));
    } finally {
      setBusy(false);
    }
  };

  const destroy = async () => {
    const id = pendingDelete?._id || pendingDelete?.id;
    try {
      await remove(id);
      toast.success("Deleted");
      setPendingDelete(null);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, `The ${singular} could not be deleted.`));
    }
  };

  return (
    <section aria-labelledby={`${singular}-heading`}>
      <h2 id={`${singular}-heading`} className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
          <Icon name={icon} size={17} />
        </span>
        {title}
        <span className="badge badge-accent">{items.length}</span>
      </h2>

      <form onSubmit={add} className="surface mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor={`new-${singular}`} className="label">
            Add a {singular}
          </label>
          <input
            id={`new-${singular}`}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={singular === "district" ? "Kegalle" : "Software Engineering"}
            className="field"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy || !name.trim()}>
          <Icon name="plus" size={16} />
          Add
        </button>
      </form>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title={`We could not load the ${title.toLowerCase()}`}
            message={apiErrorMessage(error, "The admin service is not responding.")}
            onRetry={reload}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={icon}
            title={`No ${title.toLowerCase()} yet`}
            message={`Add the first ${singular} using the form above.`}
          />
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const id = item._id || item.id;
              const itemName = item.name || item.title || String(id);
              const isEditing = editing === id;
              return (
                <li
                  key={id}
                  className="surface flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  {isEditing ? (
                    <>
                      <label htmlFor={`edit-${id}`} className="sr-only">
                        Name of {itemName}
                      </label>
                      <input
                        id={`edit-${id}`}
                        type="text"
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="field !w-auto flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn btn-primary !px-3"
                        onClick={() => saveEdit(item)}
                        disabled={busy}
                      >
                        <Icon name="check" size={15} />
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost !px-2"
                        onClick={() => setEditing(null)}
                        aria-label="Cancel edit"
                      >
                        <Icon name="x" size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 flex-1 truncate font-medium text-ink">{itemName}</span>
                      {item.jobCount ?? item.count !== undefined ? (
                        <span className="badge">{item.jobCount ?? item.count} jobs</span>
                      ) : null}
                      <button
                        type="button"
                        className="btn btn-ghost !px-2"
                        onClick={() => {
                          setEditing(id);
                          setEditName(itemName);
                        }}
                        aria-label={`Edit ${itemName}`}
                      >
                        <Icon name="pencil" size={15} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost !px-2 text-danger"
                        onClick={() => setPendingDelete(item)}
                        aria-label={`Delete ${itemName}`}
                      >
                        <Icon name="trash" size={15} />
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete this ${singular}?`}
        message="Existing jobs keep their value but will no longer appear in the filter lists."
        confirmLabel="Delete"
        danger
        onConfirm={destroy}
        onClose={() => setPendingDelete(null)}
      />
    </section>
  );
}
