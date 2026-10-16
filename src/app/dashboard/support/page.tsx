import Link from "next/link";
import { ArrowRight, CircleHelp, LifeBuoy } from "lucide-react";
import { EmptyState } from "@/shared/components/feedback/empty-state";

export default function SupportPage() {
  return (
    <div className="mx-auto w-full max-w-4xl pb-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-2 flex items-center gap-2 text-[11px] text-[#687693]"
      >
        <Link href="/dashboard" className="text-[#075bff] hover:underline">
          Dashboard
        </Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page" className="font-medium text-[#253454]">
          Help &amp; Support
        </span>
      </nav>
      <header className="mb-4">
        <h1 className="text-[27px] leading-tight font-bold tracking-[-.045em] text-[#101b43] sm:text-[32px]">
          Help &amp; Support
        </h1>
        <p className="mt-1 text-[12px] text-[#61708e]">
          Find help with your account and event setup.
        </p>
      </header>
      <section className="rounded-[14px] border border-[#e5ebf4] bg-white p-4 shadow-[0_3px_14px_rgba(18,44,78,.025)] sm:p-6">
        <EmptyState
          icon={<LifeBuoy size={24} strokeWidth={1.8} />}
          title="Support resources aren’t connected yet"
          description="Help articles and support requests will appear here when the support service is available. You can still review your event setup and readiness in the dashboard."
          action={{ label: "Review readiness", href: "/dashboard/readiness" }}
          secondaryAction={{
            label: "Browse events",
            href: "/dashboard/events",
          }}
          className="border-0 bg-transparent"
        />
      </section>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/dashboard/settings/account"
          className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[#dce5f2] bg-white px-3.5 py-2.5 text-[11px] font-semibold text-[#075bff] hover:bg-[#f7faff]"
        >
          <CircleHelp size={16} aria-hidden="true" /> Account help{" "}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
