"use client";

import { useEffect } from "react";

/**
 * Server Action IDs are part of the build output and change on every deploy, so
 * a tab left open across a release calls an ID the server no longer knows and
 * Next throws "Failed to find Server Action". The documented handling is to
 * offer a retry path instead of failing hard — a reload picks up the new build.
 */
const isStaleBuild = (error: Error) =>
  /Failed to find Server Action/i.test(error.message);

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const stale = isStaleBuild(error);

  return (
    <div className="mx-auto max-w-lg border border-neutral-200 p-8 text-center sm:p-12">
      <h1 className="font-display text-2xl text-ink">
        {stale ? "The site was updated" : "Something went wrong"}
      </h1>

      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        {stale ? (
          <>
            A new version was published while this page was open, so saving from
            this tab no longer works. Reload and make the change again — nothing
            already saved is affected.
          </>
        ) : (
          <>
            The change was not saved. Try again, and if it keeps happening send
            this code to your developer.
          </>
        )}
      </p>

      {error.digest ? (
        <p className="mt-4 font-mono text-xs text-neutral-400">
          {error.digest}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-ink px-7 py-3 text-xs uppercase tracking-[0.2em] text-cream transition-colors hover:bg-graphite"
        >
          Reload the page
        </button>
        {stale ? null : (
          <button
            type="button"
            onClick={reset}
            className="px-7 py-3 text-xs uppercase tracking-[0.2em] text-neutral-500 underline underline-offset-8 hover:text-ink"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
