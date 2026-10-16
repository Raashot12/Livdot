import { PublicOrderConfirmationPage } from "@/features/public-events/presentation/pages/public-order-confirmation-page";

export default async function OrderConfirmationPage({
  params,
}: {
  readonly params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <PublicOrderConfirmationPage orderId={orderId} />;
}
