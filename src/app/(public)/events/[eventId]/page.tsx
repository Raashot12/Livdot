import { PublicEventDetailPage } from "@/features/public-events/presentation/pages/public-event-detail-page";

export default async function EventDetailsPage({
  params,
}: {
  readonly params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <PublicEventDetailPage eventId={eventId} />;
}
