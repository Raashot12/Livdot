import { EventCrewStreamingPage } from "@/features/events/presentation/views/event-crew-streaming-page";

export default async function CrewPage({
  params,
  searchParams,
}: {
  readonly params: Promise<{ eventId: string }>;
  readonly searchParams: Promise<{ tab?: string }>;
}) {
  const [{ eventId }, { tab }] = await Promise.all([params, searchParams]);
  return <EventCrewStreamingPage eventId={eventId} initialTab={tab} />;
}
