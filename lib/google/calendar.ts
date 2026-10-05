import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

/* ------------------------------------------------------------------ */
/* Cria um cliente OAuth2 autenticado com os tokens do tenant          */
/* ------------------------------------------------------------------ */

export function createCalendarClient(tokens: {
  access_token: string;
  refresh_token: string;
}) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );

  auth.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  return google.calendar({ version: "v3", auth });
}

/* ------------------------------------------------------------------ */
/* Busca os horários ocupados no Google Calendar para um dia           */
/* ------------------------------------------------------------------ */

export async function getBusySlots(
  tokens: { access_token: string; refresh_token: string },
  calendarId: string,
  date: string // "YYYY-MM-DD"
): Promise<Array<{ start: string; end: string }>> {
  const calendar = createCalendarClient(tokens);

  const timeMin = `${date}T00:00:00Z`;
  const timeMax = `${date}T23:59:59Z`;

  const { data } = await calendar.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    },
  });

  const busy = data.calendars?.[calendarId]?.busy ?? [];

  return busy.map((slot) => ({
    start: toTimeString(slot.start!),
    end: toTimeString(slot.end!),
  }));
}

/* ------------------------------------------------------------------ */
/* Cria um evento no Google Calendar após confirmação                  */
/* ------------------------------------------------------------------ */

export async function createCalendarEvent(
  tokens: { access_token: string; refresh_token: string },
  calendarId: string,
  event: {
    title: string;
    description?: string;
    date: string;       // "YYYY-MM-DD"
    startTime: string;  // "HH:MM"
    endTime: string;    // "HH:MM"
    attendeeEmail?: string;
    timeZone?: string;
  }
) {
  const calendar = createCalendarClient(tokens);
  const tz = event.timeZone ?? "America/Sao_Paulo";

  const { data } = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: `${event.date}T${event.startTime}:00`,
        timeZone: tz,
      },
      end: {
        dateTime: `${event.date}T${event.endTime}:00`,
        timeZone: tz,
      },
      attendees: event.attendeeEmail
        ? [{ email: event.attendeeEmail }]
        : [],
    },
  });

  return data;
}

/* ------------------------------------------------------------------ */
/* Calcula os slots livres dado os ocupados e as regras de trabalho    */
/* ------------------------------------------------------------------ */

export function calculateFreeSlots(
  busySlots: Array<{ start: string; end: string }>,
  options: {
    workStart?: string;   // "09:00"
    workEnd?: string;     // "18:00"
    durationMinutes?: number;
    intervalMinutes?: number;
  } = {}
): Array<{ start: string; end: string }> {
  const {
    workStart = "09:00",
    workEnd = "18:00",
    durationMinutes = 60,
    intervalMinutes = 0,
  } = options;

  const freeSlots: Array<{ start: string; end: string }> = [];

  let cursor = toMinutes(workStart);
  const end = toMinutes(workEnd);
  const step = durationMinutes + intervalMinutes;

  while (cursor + durationMinutes <= end) {
    const slotStart = cursor;
    const slotEnd = cursor + durationMinutes;

    const isBusy = busySlots.some((busy) => {
      const busyStart = toMinutes(busy.start);
      const busyEnd = toMinutes(busy.end);
      return slotStart < busyEnd && slotEnd > busyStart;
    });

    if (!isBusy) {
      freeSlots.push({
        start: fromMinutes(slotStart),
        end: fromMinutes(slotEnd),
      });
    }

    cursor += step;
  }

  return freeSlots;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function toTimeString(iso: string): string {
  // "2026-10-07T11:00:00Z" → "11:00"
  return new Date(iso).toISOString().slice(11, 16);
}
