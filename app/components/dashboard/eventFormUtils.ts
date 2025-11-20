export function combineDateTime(dateStr: string, timeStr: string) {
  if (!dateStr) return null;
  const sanitizedTime = parseTimeTo24h(timeStr);
  const composed = sanitizedTime ? `${dateStr}T${sanitizedTime}` : dateStr;
  const date = new Date(composed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function parseTimeTo24h(input: string) {
  if (!input) return "00:00";
  const segment = input.split("-")[0]?.trim();
  if (!segment) return "00:00";

  const twentyFourMatch = segment.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (twentyFourMatch) {
    const [, h, m] = twentyFourMatch;
    return `${h.padStart(2, "0")}:${m}`;
  }

  const twelveHourMatch = segment.match(/^([0-1]?\d):([0-5]\d)\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    let hour = parseInt(twelveHourMatch[1], 10);
    const minute = twelveHourMatch[2];
    const meridiem = twelveHourMatch[3].toUpperCase();
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  }

  return segment;
}

export function splitDateTimeFields(dateStr: string | null | undefined) {
  if (!dateStr) return { datePart: "", timePart: "" };
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return { datePart: "", timePart: "" };
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const datePart = `${year}-${month}-${day}`;
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return { datePart, timePart: `${hours}:${minutes}` };
}
