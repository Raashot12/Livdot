import { PublicEventPaymentPage } from "@/features/public-events/presentation/pages/public-event-payment-page";

export default async function CheckoutDetailsPage({
  params,
}: {
  readonly params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <PublicEventPaymentPage eventId={eventId} />;
}
