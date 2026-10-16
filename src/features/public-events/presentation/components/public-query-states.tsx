import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

export function PublicLoadingState({
  label = "Loading event information",
  variant = "listing",
}: {
  readonly label?: string;
  readonly variant?: "listing" | "page";
}) {
  if (variant === "page") {
    return (
      <div role="status" aria-label={label}>
        <span className="sr-only">{label}</span>
        <div className="h-4 w-44 animate-pulse rounded bg-[#eef3fa]" />
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.82fr)]">
          <div className="min-h-[270px] animate-pulse rounded-2xl border border-[#e5ebf4] bg-white sm:min-h-[320px]" />
          <div className="min-h-[270px] animate-pulse rounded-2xl border border-[#e5ebf4] bg-[#eef3fa] sm:min-h-[320px]" />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-h-56 animate-pulse rounded-2xl border border-[#e5ebf4] bg-white" />
          <div className="min-h-56 animate-pulse rounded-2xl border border-[#e5ebf4] bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={label}
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[#e5ebf4] bg-white p-3.5"
        >
          <div className="h-40 animate-pulse rounded-xl bg-[#eef3fa]" />
          <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-[#eef3fa]" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-[#f2f5fa]" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-[#f2f5fa]" />
        </div>
      ))}
    </div>
  );
}

export function PublicRequestError({
  onRetry,
  title = "Events could not be loaded",
}: {
  readonly onRetry: () => void;
  readonly title?: string;
}) {
  return (
    <section
      role="alert"
      className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-[#e5ebf4] bg-white px-6 py-10 text-center shadow-[0_8px_30px_rgba(11,21,56,.04)] sm:px-10"
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-rose-50 text-[#e52f48]">
        <AlertTriangle size={23} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl font-semibold tracking-[-.025em] text-[#0b1538]">
        {title}
      </h2>
      <p className="mt-2 max-w-[44ch] text-sm leading-6 text-[#687693]">
        The event service could not complete the request. Check your connection
        and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="focus-ring mt-5 inline-flex min-h-10 items-center gap-2 rounded-[10px] border border-[#dbe5f2] bg-white px-4 text-sm font-semibold text-[#075bff] transition hover:bg-[#f2f6fc]"
      >
        <RefreshCw size={16} aria-hidden="true" />
        Try again
      </button>
      <Link
        href="/"
        className="focus-ring mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#075bff] hover:bg-[#eef4ff]"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Browse events
      </Link>
    </section>
  );
}

export function PublicBackLink({ href = "/" }: { readonly href?: string }) {
  return (
    <Link
      href={href}
      className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#075bff] hover:bg-[#eef4ff]"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back to events
    </Link>
  );
}
