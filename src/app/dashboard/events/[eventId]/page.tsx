import { EventPublicPage } from "@/features/events/presentation/views/event-public-page";

export default async function EventDetailPage({
  params,
}: {
  readonly params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventPublicPage eventId={eventId} />;
}
