import type { AccountRole } from "../../domain/entities/account-identity";

export function getAccountDestination(
  role: AccountRole,
  requestedPath?: string,
) {
  const fallback = role === "host" ? "/dashboard" : "/";
  if (
    !requestedPath ||
    !requestedPath.startsWith("/") ||
    requestedPath.startsWith("//") ||
    requestedPath.includes("\\") ||
    /^\/(?:sign-in|create-account)(?:\/|\?|$)/.test(requestedPath)
  ) {
    return fallback;
  }
  if (role === "guest" && /^\/dashboard(?:\/|$)/.test(requestedPath)) {
    return "/";
  }
  return requestedPath;
}

export function getAccountInitials(fullName?: string | null) {
  const initials = (fullName ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return initials || "ME";
}
