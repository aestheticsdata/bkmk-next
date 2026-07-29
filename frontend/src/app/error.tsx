"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-grey1 px-4 py-16 font-ubuntu">
      <div className="flex w-full max-w-2xl flex-col items-center rounded-sm bg-grey0 p-8 text-grey4 shadow-dashboard">
        <p className="mb-2 text-xxs uppercase tracking-widest text-generalWarning">Application error</p>
        <h1 className="mb-4 text-center text-2xl font-bold">Quelque chose s&apos;est mal passé</h1>
        <p className="mb-8 text-center text-sm text-grey2">
          La page n&apos;a pas pu se charger. Réessayez, ou revenez à l&apos;index.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-sm bg-blueNavy px-4 py-2 text-sm text-white hover:bg-spendingActionHover"
            onClick={reset}
          >
            Réessayer
          </button>
          <a
            className="rounded-sm bg-grey01 px-4 py-2 text-sm hover:bg-grey1"
            href="/bookmarks?page=0"
          >
            Retour à l&apos;index
          </a>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <pre className="mt-6 w-full overflow-auto rounded-sm bg-grey1 p-3 text-xxs text-generalWarning">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
