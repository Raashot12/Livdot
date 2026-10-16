export function formatEventDateTime(
  value: string | null,
  options: Intl.DateTimeFormatOptions,
  fallback = "Date to be announced",
) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-NG", {
    ...options,
    timeZone: "Africa/Lagos",
  }).format(date);
}

export function formatEventTime(
  value: string | null,
  fallback = "Time not set",
) {
  const time = formatEventDateTime(
    value,
    { hour: "numeric", minute: "2-digit", hour12: true },
    fallback,
  );
  return time === fallback ? fallback : `${time} (WAT)`;
}
