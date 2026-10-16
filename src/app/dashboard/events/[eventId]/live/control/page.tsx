import { EventLiveBroadcastControlPage } from "@/features/events/presentation/views/event-live-broadcast-control-page";

export default async function LiveBroadcastControlPage({
  params,
}: {
  readonly params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventLiveBroadcastControlPage eventId={eventId} />;
}
