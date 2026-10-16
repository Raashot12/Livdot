"use client";
import { useQuery } from "@tanstack/react-query";
import { useEventRepository } from "./event-repository.context";
import { eventQueryKeys } from "../queries/event-query-keys";

export function useEvents() {
  const repository = useEventRepository();
  return useQuery({
    queryKey: eventQueryKeys.lists(),
    queryFn: () => repository.list(),
  });
}
