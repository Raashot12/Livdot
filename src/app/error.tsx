"use client";
export default function GlobalError({
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">
          The page could not be loaded. Try again.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground mt-5 rounded-lg px-4 py-2 text-sm font-medium"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
