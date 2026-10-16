import { PublicEventCheckoutPage } from "@/features/public-events/presentation/pages/public-event-checkout-page";

export default async function CheckoutPage({
  params,
}: {
  readonly params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <PublicEventCheckoutPage eventId={eventId} />;
}
