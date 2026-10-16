import { EventReadinessPage } from "@/features/events/presentation/views/event-readiness-page";

export default async function ReadinessPage({
  params,
}: {
  readonly params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventReadinessPage eventId={eventId} />;
}
