import { EventLiveControlPage } from "@/features/events/presentation/views/event-live-control-page";

export default async function LivePage({
  params,
}: {
  readonly params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventLiveControlPage eventId={eventId} />;
}
