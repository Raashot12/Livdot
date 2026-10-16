export interface EventReadiness {
  readonly crewAssigned: boolean;
  readonly ingestConfigured: boolean;
  readonly ticketPricingConfigured: boolean;
}

export type ReadinessBlocker =
  | {
      readonly code: "CREW_NOT_ASSIGNED";
      readonly message: "Assign production crew";
    }
  | {
      readonly code: "INGEST_NOT_CONFIGURED";
      readonly message: "Configure streaming ingest";
    }
  | {
      readonly code: "TICKET_PRICING_NOT_CONFIGURED";
      readonly message: "Configure ticket pricing";
    };
