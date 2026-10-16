"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { EventReadiness } from "../../domain/types/event-readiness";
import { UpdateEventReadinessUseCase } from "../use-cases/update-event-readiness.use-case";
import { useEventRepository } from "./event-repository.context";
import { eventQueryKeys } from "../queries/event-query-keys";

export function useUpdateEventReadiness() {
  const queryClient = useQueryClient();
  const repository = useEventRepository();

  return useMutation({
    mutationFn: ({
      id,
      readiness,
    }: {
      id: string;
      readiness: Partial<EventReadiness>;
    }) => new UpdateEventReadinessUseCase(repository).execute(id, readiness),
    onSuccess: (event) => {
      queryClient.setQueryData(eventQueryKeys.detail(event.id), event);
      void queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
    },
  });
}
