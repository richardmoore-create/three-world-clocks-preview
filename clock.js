export const LOCATIONS = Object.freeze([
  Object.freeze({ id: "eastern", label: "US Eastern Time", timeZone: "America/New_York" }),
  Object.freeze({ id: "london", label: "London", timeZone: "Europe/London" }),
  Object.freeze({ id: "india", label: "India", timeZone: "Asia/Kolkata" })
]);

const formatters = new Map();

function getFormatters(timeZone) {
  if (!formatters.has(timeZone)) {
    formatters.set(timeZone, {
      parts: new Intl.DateTimeFormat("en-GB", {
        timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
      }),
      date: new Intl.DateTimeFormat("en-GB", {
        timeZone, weekday: "short", day: "numeric", month: "short"
      }),
      zone: new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
    });
  }
  return formatters.get(timeZone);
}

export function getClockReading(instant, timeZone) {
  if (!(instant instanceof Date) || !Number.isFinite(instant.getTime())) {
    throw new TypeError("A valid Date is required to read the clock.");
  }
  const formatter = getFormatters(timeZone);
  const parts = Object.fromEntries(formatter.parts.formatToParts(instant).map(({ type, value }) => [type, value]));
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  const second = Number(parts.second);
  const period = hour < 12 ? "AM" : "PM";
  const time = `${hour % 12 || 12}:${String(minute).padStart(2, "0")}`;
  const zone = formatter.zone.formatToParts(instant).find(({ type }) => type === "timeZoneName").value;
  return {
    hour, minute, second, time, period,
    date: formatter.date.format(instant), zone,
    iso: instant.toISOString(),
    hourAngle: (hour % 12) * 30 + minute / 2 + second / 120,
    minuteAngle: minute * 6 + second / 10,
    secondAngle: second * 6
  };
}
