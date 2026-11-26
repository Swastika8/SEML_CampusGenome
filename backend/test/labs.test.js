import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import {
  escapeCalendarText,
  foldCalendarLine,
  calendarDates,
  createRsvpCalendar,
} from '../src/lib/calendarExport.js';

// Native runs get a unique verified test schema; default runs stay in memory.
process.env.NODE_ENV = 'test';
const nativeTest = process.env.CAMPUS_TEST_POSTGRES === '1';
const schema = 'cg_test_' + process.pid + '_' + randomBytes(5).toString('hex');
let schemaCreated = false;
process.env.DB_MODE = nativeTest ? 'postgres' : 'demo';
if (nativeTest) process.env.PGOPTIONS = '-c search_path=' + schema;
process.env.DEMO_DATA_DIR = 'memory://';
process.env.JWT_SECRET = 'campus-genome-private-export-test-secret';
process.env.API_RATE_LIMIT = '5000';
process.env.CORS_ORIGINS = 'http://localhost:5173';
const { default: app } = await import('../src/app.js');
const { default: pool, isDemo } = await import('../src/config/db.js');
const { generateToken } = await import('../src/controllers/authController.js');
let server, base, token, otherToken;

before(async () => {
  assert.equal(isDemo, !nativeTest);
  if (nativeTest) {
    assert.match(schema, /^cg_test_\d+_[a-f0-9]{10}$/);
    await pool.query('CREATE SCHEMA "' + schema + '"');
    schemaCreated = true;
    const selected = await pool.query('SELECT current_schema() AS name');
    assert.equal(selected.rows[0].name, schema, 'Export tests must use their isolated schema.');
  }
  await pool.query(await readFile(new URL('../src/db/schema.sql', import.meta.url), 'utf8'));
  await pool.query(`INSERT INTO users (id,handle,name,email,password_hash)
    VALUES (1,'@ExportsOne','Export One','one@exports.test','not-a-login-hash'),
           (2,'@ExportsTwo','Export Two','two@exports.test','not-a-login-hash')`);
  token = generateToken({ id: 1 });
  otherToken = generateToken({ id: 2 });
  server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  base = 'http://127.0.0.1:' + server.address().port + '/api/labs';
});

beforeEach(async () => {
  if (nativeTest) {
    const selected = await pool.query('SELECT current_schema() AS name');
    assert.equal(selected.rows[0].name, schema, 'Refusing cleanup outside the export test schema.');
  }
  await pool.query('TRUNCATE knowledge_nodes RESTART IDENTITY CASCADE');
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  try {
    if (schemaCreated) {
      assert.match(schema, /^cg_test_\d+_[a-f0-9]{10}$/);
      await pool.query('DROP SCHEMA "' + schema + '" CASCADE');
    }
  } finally {
    await pool.end();
  }
});

function get(path, auth = token, extraHeaders = {}) {
  return fetch(base + path, {
    headers: { ...(auth ? { Authorization: 'Bearer ' + auth } : {}), ...extraHeaders },
  });
}

function assertPrivate(response) {
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(response.headers.get('pragma'), 'no-cache');
  assert.match(response.headers.get('vary'), /Authorization/i);
}

async function node({
  title = 'Export test contribution',
  description = 'A useful contribution for an isolated export test.',
  category = 'Academics',
  status = 'Published',
  author = 1,
} = {}) {
  const result = await pool.query(
    'INSERT INTO knowledge_nodes(user_id,category,title,description,status) VALUES($1,$2,$3,$4,$5) RETURNING id',
    [author, category, title, description, status],
  );
  return result.rows[0].id;
}

async function event({ date = '2026-11-01', venue = 'Main Hall', ...details } = {}) {
  const id = await node({ ...details, category: 'Events' });
  await pool.query(
    'INSERT INTO event_nodes(node_id,event_date,event_time,venue) VALUES($1,$2,$3,$4)',
    [id, date, 'A legacy time that must not be interpreted', venue],
  );
  return id;
}

async function bookmark(id, user = 1, savedAt = '2026-10-01T12:00:00Z') {
  await pool.query('INSERT INTO bookmarks(user_id,node_id,created_at) VALUES($1,$2,$3)', [
    user,
    id,
    savedAt,
  ]);
}

async function rsvp(id, user = 1) {
  await pool.query('INSERT INTO event_attendees(user_id,node_id) VALUES($1,$2)', [user, id]);
}

test('private exports reject guests, bad tokens and removed accounts without caching failures', async () => {
  for (const path of ['/pocket', '/calendar']) {
    for (const auth of [null, 'not-a-jwt', generateToken({ id: 999 })]) {
      const response = await get(path, auth);
      assert.equal(response.status, 401);
      assertPrivate(response);
      assert.equal((await response.json()).success, false);
    }
  }
  const missing = await get('/not-an-export');
  assert.equal(missing.status, 404);
  assertPrivate(missing);
});

test('pocket exports every own visible save with minimal public fields and stable paths', async () => {
  const older = await node({ title: 'Older save', author: 2 });
  const newer = await node({ title: 'Unicode find: कैंपस 🌱' });
  const removed = await node({ title: 'Removed secret', status: 'Removed' });
  const theirs = await node({ title: 'Someone else saved this' });
  await bookmark(older, 1, '2026-10-01T12:00:00Z');
  await bookmark(newer, 1, '2026-10-02T12:00:00Z');
  await bookmark(removed);
  await bookmark(theirs, 2);
  const response = await get('/pocket?user_id=2&page=2&limit=1');
  assert.equal(response.status, 200);
  assertPrivate(response);
  assert.match(response.headers.get('content-disposition'), /campus-genome-pocket\.json/);
  const result = await response.json();
  assert.equal(result.success, true);
  assert.equal(result.data.count, 2);
  assert.ok(Number.isFinite(Date.parse(result.data.generatedAt)));
  assert.deepEqual(
    result.data.items.map((item) => item.id),
    [newer, older],
  );
  assert.deepEqual(Object.keys(result.data.items[0]).sort(), [
    'authorName',
    'category',
    'createdAt',
    'description',
    'id',
    'path',
    'savedAt',
    'title',
  ]);
  assert.equal(result.data.items[0].path, '/nodes/' + newer);
  assert.equal(result.data.items[0].savedAt, '2026-10-02T12:00:00.000Z');
  assert.equal(result.data.items[1].authorName, 'Export Two');
  const other = await (await get('/pocket', otherToken)).json();
  assert.deepEqual(
    other.data.items.map((item) => item.id),
    [theirs],
  );
  assert.ok(!JSON.stringify(result).includes('@exports.test'));
  assert.ok(!JSON.stringify(result).includes('password_hash'));
  assert.equal((await pool.query('SELECT COUNT(*)::int AS count FROM bookmarks')).rows[0].count, 4);
});

test('empty private collections produce complete usable exports', async () => {
  const pocket = await get('/pocket');
  assertPrivate(pocket);
  const json = await pocket.json();
  assert.equal(json.data.count, 0);
  assert.deepEqual(json.data.items, []);
  const calendar = await get('/calendar');
  assert.equal(calendar.status, 200);
  assertPrivate(calendar);
  assert.equal(calendar.headers.get('x-campus-skipped-events'), '0');
  assert.equal(
    await calendar.text(),
    'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Campus Genome//Private RSVP Export//EN\r\nCALSCALE:GREGORIAN\r\nX-WR-CALNAME:Campus Genome RSVPs (all-day)\r\nEND:VCALENDAR\r\n',
  );
});

test('calendar exports only own visible RSVPs as all-day dates, including past events', async () => {
  const past = await event({ title: 'Past leap-day event', date: '2024-02-29' });
  const future = await event({ title: 'Future year-end event', date: '2030-12-31' });
  const removed = await event({ title: 'Removed RSVP', status: 'Removed' });
  const theirs = await event({ title: 'Other account RSVP' });
  await rsvp(past);
  await rsvp(future);
  await rsvp(removed);
  await rsvp(theirs, 2);
  const response = await get('/calendar?user_id=2', token, { Origin: 'http://localhost:5173' });
  assert.equal(response.status, 200);
  assertPrivate(response);
  assert.match(response.headers.get('content-type'), /^text\/calendar; charset=utf-8$/i);
  assert.match(response.headers.get('content-disposition'), /campus-genome-rsvps\.ics/);
  assert.match(response.headers.get('access-control-expose-headers'), /X-Campus-Skipped-Events/i);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const calendar = await response.text();
  assert.equal((calendar.match(/^BEGIN:VEVENT$/gm) || []).length, 2);
  assert.match(calendar, /DTSTART;VALUE=DATE:20240229\r\nDTEND;VALUE=DATE:20240301/);
  assert.match(calendar, /DTSTART;VALUE=DATE:20301231\r\nDTEND;VALUE=DATE:20310101/);
  assert.match(calendar, /^DTSTAMP:[0-9]{8}T[0-9]{6}Z\r$/m);
  assert.match(calendar, new RegExp('UID:campus-genome-event-' + past + '@campusgenome.app'));
  assert.ok(!calendar.includes('Removed RSVP'));
  assert.ok(!calendar.includes('Other account RSVP'));
  assert.ok(!calendar.includes('legacy time'));
  assert.ok(!calendar.includes('TZID'));
  assert.equal(
    (await pool.query('SELECT COUNT(*)::int AS count FROM event_attendees')).rows[0].count,
    4,
  );
  const repeated = await (await get('/calendar')).text();
  assert.deepEqual(repeated.match(/^UID:.*$/gm), calendar.match(/^UID:.*$/gm));
});

test('calendar skips invalid legacy dates rather than guessing dates or inventing times', async () => {
  for (const date of [
    '2026-02-30',
    '2025-02-29',
    'November 1, 2026',
    '2026-13-01',
    '0000-01-01',
    '9999-12-31',
  ]) {
    await rsvp(await event({ date }));
  }
  const valid = await event({ title: 'Valid date', date: '2028-02-29' });
  await rsvp(valid);
  const response = await get('/calendar');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-campus-skipped-events'), '6');
  const calendar = await response.text();
  assert.equal((calendar.match(/^BEGIN:VEVENT$/gm) || []).length, 1);
  assert.match(calendar, /DTSTART;VALUE=DATE:20280229/);
});

test('calendar TEXT escaping prevents line injection and preserves Unicode when folded', async () => {
  const title = 'कैंपस 🌱, meet; path\\hall\r\nBEGIN:VEVENT\r\nUID:forged';
  const description = 'First line\nSecond line; commas, slash\\ ' + '👩🏽‍💻'.repeat(100);
  const venue = 'Hall; East, Room\\A\nFloor 2';
  await rsvp(await event({ title, description, venue }));
  const response = await get('/calendar');
  const calendar = await response.text();
  assert.ok(calendar.endsWith('\r\n'));
  assert.doesNotMatch(calendar, /(?<!\r)\n|\r(?!\n)/);
  for (const line of calendar.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75);
  assert.equal((calendar.match(/^BEGIN:VEVENT$/gm) || []).length, 1);
  assert.doesNotMatch(calendar, /^UID:forged\r$/m);
  const unfolded = calendar.replace(/\r\n[ \t]/g, '');
  assert.ok(
    unfolded.includes(String.raw`SUMMARY:कैंपस 🌱\, meet\; path\\hall\nBEGIN:VEVENT\nUID:forged`),
  );
  assert.ok(unfolded.includes(String.raw`LOCATION:Hall\; East\, Room\\A\nFloor 2`));
  assert.ok(unfolded.includes('👩🏽‍💻'.repeat(100)));
  assert.ok(!calendar.includes('\uFFFD'));
  assert.ok(!unfolded.includes('\r\nBEGIN:VEVENT\r\nUID:forged'));
});

test('calendar primitives validate exact Gregorian dates and handle UTC day rollover', () => {
  assert.deepEqual(calendarDates('2024-02-29'), { start: '20240229', end: '20240301' });
  assert.deepEqual(calendarDates('0099-12-31'), { start: '00991231', end: '01000101' });
  assert.deepEqual(calendarDates('2026-12-31'), { start: '20261231', end: '20270101' });
  for (const invalid of [
    null,
    '',
    '2026-1-01',
    '2026-04-31',
    '2026-00-01',
    '2026-01-00',
    '2026-01-01\r\nX:1',
  ]) {
    assert.equal(calendarDates(invalid), null);
  }
  assert.equal(escapeCalendarText('a\\b,c;d\r\ne\rf\ng\u0000'), String.raw`a\\b\,c\;d\ne\nf\ng`);
  const line = 'SUMMARY:' + '🌱'.repeat(100);
  const folded = foldCalendarLine(line);
  assert.equal(folded.replace(/\r\n /g, ''), line);
  assert.ok(folded.includes('\r\n '));
  for (const physical of folded.split('\r\n')) assert.ok(Buffer.byteLength(physical) <= 75);
  const built = createRsvpCalendar(
    [{ id: 7, title: 'Test', event_date: '2026-01-01' }],
    new Date('2026-11-01T12:34:56Z'),
  );
  assert.match(built.content, /DTSTAMP:20261101T123456Z/);
});

test('pocket exports exactly 1000 entries but returns 413 instead of silently truncating 1001', async () => {
  await pool.query(`INSERT INTO knowledge_nodes(user_id,category,title,description)
    SELECT 1,'Academics','Bulk save '||n,'A valid isolated test entry.' FROM generate_series(1,1001) n`);
  await pool.query('INSERT INTO bookmarks(user_id,node_id) SELECT 1,id FROM knowledge_nodes');
  const tooLarge = await get('/pocket');
  assert.equal(tooLarge.status, 413);
  assertPrivate(tooLarge);
  const error = await tooLarge.json();
  assert.equal(error.success, false);
  assert.match(error.message, /1000.*no partial/i);
  assert.equal(tooLarge.headers.get('content-disposition'), null);
  await pool.query('DELETE FROM bookmarks WHERE node_id=1001');
  const full = await (await get('/pocket')).json();
  assert.equal(full.data.count, 1000);
  assert.equal(full.data.items.length, 1000);
  assert.equal(new Set(full.data.items.map((item) => item.id)).size, 1000);
});

test('calendar enforces the 1000-RSVP limit before skipping bad legacy dates', async () => {
  await pool.query(`INSERT INTO knowledge_nodes(user_id,category,title,description)
    SELECT 1,'Events','Bulk RSVP '||n,'A valid isolated calendar test.' FROM generate_series(1,1001) n`);
  await pool.query(
    "INSERT INTO event_nodes(node_id,event_date) SELECT id,'2026-11-01' FROM knowledge_nodes",
  );
  await pool.query(
    'INSERT INTO event_attendees(user_id,node_id) SELECT 1,node_id FROM event_nodes',
  );
  await pool.query("UPDATE event_nodes SET event_date='not a date' WHERE node_id=1001");
  const tooLarge = await get('/calendar');
  assert.equal(tooLarge.status, 413);
  assertPrivate(tooLarge);
  assert.match((await tooLarge.json()).message, /1000.*no partial/i);
  assert.equal(tooLarge.headers.get('content-disposition'), null);
  await pool.query('DELETE FROM event_attendees WHERE node_id=1001');
  const full = await get('/calendar');
  assert.equal(full.status, 200);
  assert.equal(full.headers.get('x-campus-skipped-events'), '0');
  assert.equal(((await full.text()).match(/^BEGIN:VEVENT$/gm) || []).length, 1000);
});

test('unexpected export errors retain private headers and controlled JSON', async () => {
  const original = pool.query;
  pool.query = async (sql, ...args) => {
    if (sql.includes('FROM bookmarks b')) throw new Error('Isolated export database failure');
    return original.call(pool, sql, ...args);
  };
  try {
    const response = await get('/pocket');
    assert.equal(response.status, 500);
    assertPrivate(response);
    const error = await response.json();
    assert.equal(error.success, false);
    assert.equal(error.message, 'Something went wrong. Please try again.');
    assert.ok(!JSON.stringify(error).includes('database failure'));
  } finally {
    pool.query = original;
  }
});
