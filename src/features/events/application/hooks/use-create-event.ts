"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEventRepository } from "./event-repository.context";
import { CreateEventUseCase } from "../use-cases/create-event.use-case";
import type { CreateEventInput } from "../ports/event.repository";
import { eventQueryKeys } from "../queries/event-query-keys";

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const repository = useEventRepository();

  return useMutation({
    mutationFn: (input: CreateEventInput) =>
      new CreateEventUseCase(repository).execute(input),
    onSuccess: (event) => {
      queryClient.setQueryData(eventQueryKeys.detail(event.id), event);
      void queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
    },
  });
}
