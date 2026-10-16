"use client";
import { useQuery } from "@tanstack/react-query";
import { useEventRepository } from "./event-repository.context";
import { GetEventUseCase } from "../use-cases/get-event.use-case";
import { eventQueryKeys } from "../queries/event-query-keys";

export function useEvent(id: string) {
  const repository = useEventRepository();
  return useQuery({
    queryKey: eventQueryKeys.detail(id),
    queryFn: () => new GetEventUseCase(repository).execute(id),
    enabled: id.length > 0,
  });
}
