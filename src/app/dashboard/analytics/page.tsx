import { TicketSalesAnalytics } from "@/features/events/presentation/components/dashboard-overview/ticket-sales-analytics";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4 pb-5">
      <header>
        <h1 className="text-[28px] leading-tight font-bold tracking-[-.05em] text-[#101b43] sm:text-[31px]">
          Analytics
        </h1>
        <p className="mt-1 text-[13px] text-[#61708e]">
          Audience and gross revenue from completed ticket checkouts.
        </p>
      </header>
      <TicketSalesAnalytics />
    </div>
  );
}
