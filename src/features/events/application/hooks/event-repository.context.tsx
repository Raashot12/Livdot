"use client";
import { createContext, useContext } from "react";
import type { EventRepository } from "../ports/event.repository";

export const EventRepositoryContext = createContext<EventRepository | null>(
  null,
);
export function useEventRepository(): EventRepository {
  const repository = useContext(EventRepositoryContext);
  if (!repository)
    throw new Error("EventRepositoryContext provider is missing.");
  return repository;
}
