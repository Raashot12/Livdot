import { EventTicketsOrdersPage } from "@/features/events/presentation/views/event-tickets-orders-page";

export default async function TicketsPage({
  params,
}: {
  readonly params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <EventTicketsOrdersPage eventId={eventId} />;
}
