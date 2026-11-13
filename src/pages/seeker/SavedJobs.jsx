import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Page from "../../components/layout/Page.jsx";
import Icon from "../../components/ui/Icon.jsx";
import JobCard from "../../components/ui/JobCard.jsx";
import { JobCardSkeleton } from "../../components/ui/Skeleton.jsx";
import { ErrorState } from "../../components/ui/ErrorState.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { apiErrorMessage, jobsApi } from "../../api.js";
import { toArray } from "../../utils/data.js";
import { useDocumentTitle, useFetch } from "../../utils/hooks.js";

export default function SeekerSavedJobs() {
  useDocumentTitle("Saved jobs");

  const { data, loading, error, reload } = useFetch(() => jobsApi.saved(), []);
  const jobs = toArray(data);
  const [busyId, setBusyId] = useState(null);

  const remove = async (job) => {
    const id = job.id || job._id;    setBusyId(String(id));
    try {
      await jobsApi.unsave(id);
      toast.success("Removed from saved jobs");
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not remove the saved job."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Page>
      <header className="mb-7">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink">Saved jobs</h1>
        <p className="mt-2 text-ink-muted">
          Roles you bookmarked. Apply while the deadline is still open.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="We could not load your saved jobs"
          message={apiErrorMessage(error, "The saved jobs service is not responding.")}
          onRetry={reload}
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="No saved jobs yet"
          message="Tap the bookmark on any job card to keep it here for later."
          action={
            <Link to="/jobs" className="btn btn-primary">
              Browse jobs
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, index) => {
            const id = String(job.id || job._id);
            const jobId = job.id || job._id;
            return (
              <div key={id} className="relative">
                <JobCard job={job} index={index} saved />
                <div className="mt-3 flex gap-2">
                  <Link to={`/jobs/${jobId}`} className="btn btn-primary flex-1">
                    <Icon name="send" size={15} />
                    Apply now
                  </Link>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => remove(job)}
                    disabled={busyId === id}
                    aria-label={`Remove ${job.title} from saved jobs`}
                  >
                    {busyId === id ? (
                      <Icon name="loader" size={15} className="animate-spin" />
                    ) : (
                      <Icon name="trash" size={15} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
