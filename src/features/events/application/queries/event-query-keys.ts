export const eventQueryKeys = {
  all: ["events"] as const,
  lists: () => [...eventQueryKeys.all, "list"] as const,
  details: () => [...eventQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...eventQueryKeys.details(), id] as const,
};
