import { EventReplayManagementPage } from "@/features/events/presentation/views/event-replay-management-page";

export default async function ReplayPage({
  params,
}: {
  readonly params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventReplayManagementPage eventId={eventId} />;
}
