import { useRef, useState } from "react";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import { Reveal } from "../../components/brand/useReveal.jsx";
import { Skeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { apiErrorMessage, cvApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";
import { formatDateTime } from "../../utils/format.js";
import { CV_ACCEPT, CV_EXTENSIONS, CV_MAX_BYTES } from "../../utils/constants.js";

function fileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SeekerCv() {
  useDocumentTitle("My CV");

  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const { data, loading, error, reload } = useFetch(() => cvApi.mine(), []);
  const cvs = toArray(data);

  const upload = async (file) => {
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!CV_EXTENSIONS.some((extension) => name.endsWith(extension))) {
      toast.error("Only PDF and DOCX files are accepted.");
      return;
    }
    if (file.size > CV_MAX_BYTES) {
      toast.error(`That file is ${fileSize(file.size)}. The limit is 5MB.`);
      return;
    }

    setUploading(true);
    try {
      await cvApi.upload(file);
      toast.success("CV uploaded");
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The CV could not be uploaded."));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = async () => {
    const id = pendingDelete?.id || pendingDelete?._id;
    try {
      await cvApi.remove(id);
      toast.success("CV removed");
      setPendingDelete(null);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "The CV could not be removed."));
    }
  };

  const downloadCv = async (cv, fileName) => {
    const id = cv.id || cv._id;
    try {
      await cvApi.download(id, fileName);
    } catch (err) {
      toast.error(apiErrorMessage(err, "The CV could not be downloaded."));
    }
  };

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">My CV</h1>
        <p className="mt-2 text-ink-muted">
          Upload up to 5MB in PDF, DOC or DOCX. Employers pick the CV you attach when you apply.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Reveal>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                upload(event.dataTransfer.files?.[0]);
              }}
              className={`surface flex flex-col items-center justify-center border-2 border-dashed px-6 py-12 text-center transition-colors ${
                dragActive ? "border-aurora-500 bg-aurora-500/6" : "border-line-strong"
              }`}
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                <Icon name="upload" size={24} />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-ink">
                {uploading ? "Uploading…" : "Drop your CV here"}
              </p>
              <p className="mt-1 text-sm text-ink-muted">or choose a file from your device</p>

              <input
                ref={inputRef}
                id="cv-file"
                type="file"
                accept={CV_ACCEPT}
                className="sr-only"
                onChange={(event) => upload(event.target.files?.[0])}
              />
              <label htmlFor="cv-file" className="btn btn-primary mt-5 cursor-pointer">
                <Icon name="fileText" size={16} />
                Choose file
              </label>
              <p className="mt-3 text-xs text-ink-muted">PDF or DOCX · maximum 5MB</p>
            </div>
          </Reveal>

          <section aria-labelledby="cv-list" className="mt-8">
            <h2 id="cv-list" className="font-display text-xl font-semibold text-ink">
              Uploaded CVs
            </h2>

            <div className="mt-4">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : error ? (
                <ErrorState
                  title="We could not load your CVs"
                  message={apiErrorMessage(error, "The CV service is not responding.")}
                  onRetry={reload}
                />
              ) : cvs.length === 0 ? (
                <EmptyState
                  icon="fileText"
                  title="No CV uploaded yet"
                  message="Upload a CV so you can apply to roles in one click."
                />
              ) : (
                <ul className="space-y-3">
                  {cvs.map((cv) => {
                    const id = cv.id || cv._id;
                    const fileName = cv.originalName || cv.fileName || cv.name || `CV-${id}`;
                    return (
                      <li key={id} className="surface flex flex-wrap items-center gap-4 p-4">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-aurora-500/12 text-aurora-600 dark:text-aurora-300">
                          <Icon name="fileText" size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-ink">{fileName}</p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {cv.size ? `${fileSize(cv.size)} · ` : ""}
                            {formatDateTime(cv.createdAt || cv.uploadedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary !px-3"
                            onClick={() => downloadCv(cv, fileName)}
                            aria-label={`Download ${fileName}`}
                          >
                            <Icon name="download" size={15} />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger !px-3"
                            onClick={() => setPendingDelete(cv)}
                            aria-label={`Delete ${fileName}`}
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="card-glow surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">A strong CV</h2>
            <ul className="mt-4 space-y-3 text-sm text-ink-muted">
              {[
                "One page per 10 years of experience",
                "Name, phone and email at the top",
                "Quantify results, not just duties",
                "List the tools and skills you actually use",
                "Keep the file under 5MB",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <Icon name="checkCircle" size={16} className="mt-0.5 shrink-0 text-success" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="surface p-6">
            <h2 className="font-display text-base font-semibold text-ink">How attachments work</h2>
            <p className="mt-2 text-sm text-ink-muted">
              When you apply for a role you choose which uploaded CV to send. The latest one is preselected, but
              you can change it before sending.
            </p>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this CV?"
        message="The file will be removed and can no longer be attached to an application."
        confirmLabel="Delete CV"
        danger
        onConfirm={remove}
        onClose={() => setPendingDelete(null)}
      />
    </Page>
  );
}
