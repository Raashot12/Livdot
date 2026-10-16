"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEventRepository } from "./event-repository.context";
import type { EventStatus } from "../../domain/types/event-status";
import { TransitionEventUseCase } from "../use-cases/transition-event.use-case";
import { eventQueryKeys } from "../queries/event-query-keys";

export function useTransitionEvent() {
  const queryClient = useQueryClient();
  const repository = useEventRepository();
  return useMutation({
    mutationFn: ({
      id,
      target,
      expectedVersion,
    }: {
      id: string;
      target: EventStatus;
      expectedVersion?: number;
    }) =>
      new TransitionEventUseCase(repository).execute(
        id,
        target,
        expectedVersion,
      ),
    onSuccess: (event) => {
      queryClient.setQueryData(eventQueryKeys.detail(event.id), event);
      void queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
    },
  });
}
