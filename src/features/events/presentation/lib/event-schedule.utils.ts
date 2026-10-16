export type ScheduleDateTime = {
  readonly date: string;
  readonly time: string;
};

export function getScheduleDateTime(
  timeZone: string,
  now = new Date(),
): ScheduleDateTime | null {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);
    const values = Object.fromEntries(
      parts.map(({ type, value }) => [type, value]),
    );
    const { year, month, day } = values;
    const hour = values.hour === "24" ? "00" : values.hour;
    const minute = values.minute;

    if (!year || !month || !day || !hour || !minute) return null;
    return {
      date: `${year}-${month}-${day}`,
      time: `${hour}:${minute}`,
    };
  } catch {
    return null;
  }
}

export function getScheduleDateTimeAsDate(
  date: string,
  time: string,
  timeZone: string,
) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return null;
  }

  const requestedWallTime = Date.parse(`${date}T${time}:00.000Z`);
  if (Number.isNaN(requestedWallTime)) return null;

  let candidate = requestedWallTime;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const localDateTime = getScheduleDateTime(timeZone, new Date(candidate));
    if (!localDateTime) return null;

    const representedWallTime = Date.parse(
      `${localDateTime.date}T${localDateTime.time}:00.000Z`,
    );
    const adjustment = requestedWallTime - representedWallTime;
    if (adjustment === 0) return new Date(candidate);
    candidate += adjustment;
  }

  const resolvedDateTime = getScheduleDateTime(timeZone, new Date(candidate));
  return resolvedDateTime?.date === date && resolvedDateTime.time === time
    ? new Date(candidate)
    : null;
}

export function getStartDateMinimum(timeZone: string, now = new Date()) {
  const current = getScheduleDateTime(timeZone, now);
  if (!current) return undefined;
  return current.time === "23:59" ? addOneDay(current.date) : current.date;
}

export function getStartTimeMinimum(
  date: string,
  timeZone: string,
  now = new Date(),
) {
  const current = getScheduleDateTime(timeZone, now);
  if (!current || date !== current.date) return undefined;

  const [hour = "0", minute = "0"] = current.time.split(":");
  const nextMinute = Number(hour) * 60 + Number(minute) + 1;
  const wrappedMinute = nextMinute % (24 * 60);
  const minHour = String(Math.floor(wrappedMinute / 60)).padStart(2, "0");
  const minMinute = String(wrappedMinute % 60).padStart(2, "0");
  return `${minHour}:${minMinute}`;
}

export function getLocalDateTimeMinimum(now = new Date()) {
  const minimum = new Date(now);
  minimum.setSeconds(0, 0);
  minimum.setMinutes(minimum.getMinutes() + 1);

  const date = [
    minimum.getFullYear(),
    String(minimum.getMonth() + 1).padStart(2, "0"),
    String(minimum.getDate()).padStart(2, "0"),
  ].join("-");
  const time = [
    String(minimum.getHours()).padStart(2, "0"),
    String(minimum.getMinutes()).padStart(2, "0"),
  ].join(":");

  return `${date}T${time}`;
}

function addOneDay(date: string) {
  const nextDay = new Date(`${date}T00:00:00.000Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return nextDay.toISOString().slice(0, 10);
}
