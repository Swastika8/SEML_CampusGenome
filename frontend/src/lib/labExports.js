import { API_BASE } from './api';

export { pocketMarkdown } from './pocketExport.js';

export async function getCalendarExport(token, signal) {
  const response = await fetch(API_BASE + '/labs/calendar', {
    headers: { Authorization: 'Bearer ' + token, Accept: 'text/calendar' },
    signal,
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'Your calendar could not be packed. Please try again.');
  }
  const text = await response.text();
  if (
    !response.headers.get('content-type')?.startsWith('text/calendar') ||
    !text.startsWith('BEGIN:VCALENDAR\r\n') ||
    !text.endsWith('END:VCALENDAR\r\n')
  )
    throw new Error('The calendar response was incomplete. Please try again.');
  return {
    blob: new Blob([text], { type: 'text/calendar;charset=utf-8' }),
    skipped: Number(response.headers.get('X-Campus-Skipped-Events')) || 0,
  };
}

export function saveLabDownload(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
