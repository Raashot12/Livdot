import Link from "next/link";
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="max-w-lg text-center">
        <p className="text-primary text-sm font-semibold">
          404 · Page not found
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          This page isn’t available
        </h1>
        <p className="text-muted-foreground mt-3">
          The link may be out of date, or the page may have moved.
        </p>
        <Link
          className="bg-primary text-primary-foreground mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-medium"
          href="/dashboard"
        >
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
