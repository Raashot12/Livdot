import { EventOverview } from "@/features/events/presentation/views/event-overview";

export default async function ManageEventPage({
  params,
}: {
  readonly params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventOverview eventId={eventId} />;
}
