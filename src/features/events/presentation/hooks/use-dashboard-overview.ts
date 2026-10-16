"use client";

import { useMemo } from "react";
import { useEvents } from "../../application/hooks/use-events";
import type { EventEntity } from "../../domain/entities/event.entity";
import { evaluateReadiness } from "../../domain/policies/readiness.policy";

const EMPTY_EVENTS: EventEntity[] = [];

export function useDashboardOverview() {
  const query = useEvents();
  const events = query.data ?? EMPTY_EVENTS;

  const metrics = useMemo(() => {
    const readyCount = events.filter(
      (event) => evaluateReadiness(event.readiness).ready,
    ).length;

    return {
      totalCount: events.length,
      liveCount: events.filter((event) => event.status === "LIVE").length,
      readyCount,
      attentionCount: events.length - readyCount,
    };
  }, [events]);

  return { ...query, events, metrics };
}
