import { EventsOverview } from "@/features/events/presentation/views/events-overview";
export default async function EventsPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return <EventsOverview query={q} />;
}
