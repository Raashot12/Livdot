export interface EventTicketOption {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly price: number;
  readonly currency?: string;
  readonly quantityAvailable?: number | null;
  readonly maxPerOrder?: number;
}
