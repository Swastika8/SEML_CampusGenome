const CRLF = '\r\n';

// RFC 5545 TEXT: literal line breaks and punctuation stay inside the property value.
export function escapeCalendarText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n|\u2028|\u2029/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

// Fold by UTF-8 octets, retaining whole Unicode code points. The continuation
// space also counts towards the next physical line's 75-octet budget.
export function foldCalendarLine(value) {
  const lines = [];
  let line = '';
  let octets = 0;
  for (const character of value) {
    const size = Buffer.byteLength(character, 'utf8');
    if (octets + size > 75) {
      lines.push(line);
      line = ' ';
      octets = 1;
    }
    line += character;
    octets += size;
  }
  lines.push(line);
  return lines.join(CRLF);
}

export function calendarDates(value) {
  if (typeof value !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)) return null;
  if (value.startsWith('0000-')) return null;
  const day = new Date(value + 'T00:00:00.000Z');
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== value) return null;
  const followingDay = new Date(day);
  followingDay.setUTCDate(followingDay.getUTCDate() + 1);
  // A four-digit RFC DATE cannot express the exclusive end of 9999-12-31.
  if (followingDay.getUTCFullYear() > 9999) return null;
  return {
    start: value.replaceAll('-', ''),
    end: followingDay.toISOString().slice(0, 10).replaceAll('-', ''),
  };
}

export function createRsvpCalendar(events, now = new Date()) {
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.[0-9]{3}Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Genome//Private RSVP Export//EN',
    'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Campus Genome RSVPs (all-day)',
  ];
  let skipped = 0;
  for (const event of events) {
    const dates = calendarDates(event.event_date);
    if (!dates) {
      skipped++;
      continue;
    }
    const description =
      (event.description || '') +
      '\n\nCampus Genome RSVP: /nodes/' +
      event.id +
      '\nAll-day export. Check Campus Genome for the published event time.';
    lines.push(
      'BEGIN:VEVENT',
      'UID:campus-genome-event-' + event.id + '@campusgenome.app',
      'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + dates.start,
      'DTEND;VALUE=DATE:' + dates.end,
      'SUMMARY:' + escapeCalendarText(event.title),
      'DESCRIPTION:' + escapeCalendarText(description),
      'LOCATION:' + escapeCalendarText(event.venue),
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return { content: lines.map(foldCalendarLine).join(CRLF) + CRLF, skipped };
}
