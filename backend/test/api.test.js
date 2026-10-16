import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

process.env.NODE_ENV = 'test';
const nativeTest = process.env.CAMPUS_TEST_POSTGRES === '1';
const schema = 'cg_test_' + process.pid + '_' + randomBytes(5).toString('hex');
let schemaCreated = false;
process.env.DB_MODE = nativeTest ? 'postgres' : 'demo';
if (nativeTest) process.env.PGOPTIONS = '-c search_path=' + schema;
process.env.DEMO_DATA_DIR = 'memory://';
process.env.JWT_SECRET = 'campus-genome-isolated-integration-test-secret';
const { default: app } = await import('../src/app.js');
const { default: pool, transaction } = await import('../src/config/db.js');
const { bootstrap } = await import('../src/db/bootstrap.js');
let server, base, token, otherToken, createdId;
async function request(path, { method = 'GET', body, auth = token, headers = {} } = {}) {
  const response = await fetch(base + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(auth ? { Authorization: 'Bearer ' + auth } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json(), headers: response.headers };
}
before(async () => {
  if (nativeTest) {
    await pool.query('CREATE SCHEMA "' + schema + '"');
    schemaCreated = true;
    const selected = await pool.query('SELECT current_schema() AS name');
    assert.equal(selected.rows[0].name, schema, 'Tests must use their isolated schema.');
  }
  await bootstrap();
  if (nativeTest) {
    await pool.query(await readFile(new URL('../src/db/seed.sql', import.meta.url), 'utf8'));
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + 3);
    await pool.query('UPDATE event_nodes SET event_date=$1', [date.toISOString().slice(0, 10)]);
  }
  server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (schemaCreated) {
    assert.match(schema, /^cg_test_\d+_[a-f0-9]{10}$/);
    await pool.query('DROP SCHEMA "' + schema + '" CASCADE');
  }
  await pool.end();
});

test('health and statistics reflect actual rows', async () => {
  const h = await request('/health');
  assert.equal(h.status, 200);
  assert.equal(h.body.mode, nativeTest ? 'postgres' : 'demo');
  const s = await request('/stats');
  assert.equal(s.body.data.contributions, 22);
  assert.equal(s.body.data.verifications, 7);
});
test('unknown routes, malformed JSON, IDs and pagination return controlled errors', async () => {
  assert.equal((await request('/missing')).status, 404);
  for (const query of [
    'limit=0',
    'limit=101',
    'page=-1',
    'page=abc',
    'category=Unknown',
    'sort=unsafe',
  ])
    assert.equal((await request('/nodes?' + query)).status, 400, query);
  assert.equal((await request('/nodes/abc')).status, 400);
  const response = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(response.status, 400);
  assert.ok(!(await response.text()).includes('stack'));
});
test('guest writes are rejected across every write surface', async () => {
  for (const [path, method] of [
    ['/nodes', 'POST'],
    ['/nodes/1/verify', 'POST'],
    ['/nodes/1/comments', 'POST'],
    ['/nodes/1/bookmark', 'PUT'],
    ['/nodes/1/rsvp', 'PUT'],
    ['/buildings/b1/history', 'POST'],
    ['/courses/c1/reviews', 'POST'],
  ]) {
    assert.equal((await request(path, { method, body: {}, auth: null })).status, 401, path);
  }
});
test('student sessions work and password hashes never leave the API', async () => {
  if (nativeTest)
    assert.equal(
      (await request('/auth/demo', { method: 'POST', body: {}, auth: null })).status,
      404,
    );
  const result = nativeTest
    ? await request('/auth/login', {
        method: 'POST',
        body: { loginIdentifier: '@StudentJohn', password: 'password123' },
        auth: null,
      })
    : await request('/auth/demo', { method: 'POST', body: {}, auth: null });
  assert.equal(result.status, 200);
  token = result.body.token;
  assert.ok(token);
  assert.equal(result.body.user.handle, '@StudentJohn');
  assert.equal(result.body.user.password_hash, undefined);
  assert.equal((await request('/auth/me', { auth: 'invalid' })).status, 401);
});
test('registration validates inputs and handles case-insensitive duplicates', async () => {
  assert.equal(
    (
      await request('/auth/register', {
        method: 'POST',
        body: { name: 'A', handle: 'a', email: 'bad', password: 'x' },
      })
    ).status,
    400,
  );
  const body = {
    name: 'Integration Student',
    handle: 'integration_student',
    email: 'integration@campus.edu',
    password: 'sensiblePassword123',
    graduationYear: 2030,
  };
  const registered = await request('/auth/register', { method: 'POST', body });
  assert.equal(registered.status, 201);
  otherToken = registered.body.token;
  assert.equal(
    (
      await request('/auth/register', {
        method: 'POST',
        body: { ...body, email: 'INTEGRATION@CAMPUS.EDU', handle: 'another_student' },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await request('/auth/login', {
        method: 'POST',
        body: { loginIdentifier: body.email, password: 'wrong' },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request('/auth/login', {
        method: 'POST',
        body: { loginIdentifier: '@INTEGRATION_STUDENT', password: body.password },
      })
    ).status,
    200,
  );
});
test('filtered, paginated and literal searches return stable results', async () => {
  const first = await request('/nodes?category=Academics&limit=2&page=1');
  const second = await request('/nodes?category=Academics&limit=2&page=2');
  assert.equal(first.body.pagination.total, 4);
  assert.equal(first.body.data.length, 2);
  assert.notEqual(first.body.data[0].id, second.body.data[0].id);
  assert.equal(
    (await request('/nodes?search=' + encodeURIComponent("' OR 1=1 --"))).body.data.length,
    0,
  );
  assert.ok(
    (await request('/nodes?search=%25')).body.data.every((n) =>
      (n.title + ' ' + n.description).includes('%'),
    ),
  );
});
test('contributions persist all category details and award reputation once', async () => {
  const before = await request('/auth/me');
  const result = await request('/nodes', {
    method: 'POST',
    body: {
      category: 'Academics',
      title: 'Integration guide',
      description: 'A useful and accurate guide for the integration test.',
      department: 'CS',
      year: 'TY',
      subject: 'Databases',
    },
  });
  assert.equal(result.status, 201);
  createdId = result.body.data.id;
  const node = await request('/nodes/' + createdId);
  assert.equal(node.body.data.academic_details.subject, 'Databases');
  assert.equal(
    (await request('/auth/me')).body.user.reputation_score,
    before.body.user.reputation_score + 10,
  );
  const invalid = await request('/nodes', {
    method: 'POST',
    body: {
      category: 'Career',
      title: 'Bad URL',
      description: 'This has an unsafe application URL.',
      applyLink: 'javascript:alert(1)',
    },
  });
  assert.equal(invalid.status, 400);
  assert.equal(
    (
      await request('/nodes', {
        method: 'POST',
        body: {
          category: 'Events',
          title: 'Undated',
          description: 'This event is missing a required date.',
        },
      })
    ).status,
    400,
  );
});
test('transactions roll back partially completed writes', async () => {
  await assert.rejects(
    transaction(async (client) => {
      await client.query(
        "INSERT INTO knowledge_nodes (category,title,description) VALUES ('Academics','Must roll back','Temporary test row')",
      );
      throw new Error('Force rollback');
    }),
  );
  assert.equal(
    (
      await pool.query(
        "SELECT COUNT(*)::int AS count FROM knowledge_nodes WHERE title='Must roll back'",
      )
    ).rows[0].count,
    0,
  );
});
test('bookmarks are idempotent, persistent and private per student', async () => {
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await request('/nodes/' + createdId + '/bookmark', { method: 'PUT' })).status,
      200,
    );
  const saved = await request('/nodes?saved=true');
  assert.equal(saved.body.data.length, 1);
  assert.equal(saved.body.data[0].is_saved, true);
  assert.equal((await request('/nodes?saved=true', { auth: otherToken })).body.data.length, 0);
  assert.equal((await request('/nodes?saved=true', { auth: null })).status, 401);
  for (let i = 0; i < 2; i++)
    await request('/nodes/' + createdId + '/bookmark', { method: 'DELETE' });
  assert.equal((await request('/nodes?saved=true')).body.data.length, 0);
});
test('verification rejects self-votes and serializes concurrent toggles', async () => {
  assert.equal((await request('/nodes/' + createdId + '/verify', { method: 'POST' })).status, 403);
  const path = '/nodes/' + createdId + '/verify';
  const both = await Promise.all([
    request(path, { method: 'POST', auth: otherToken }),
    request(path, { method: 'POST', auth: otherToken }),
  ]);
  assert.ok(both.every((r) => r.status === 200));
  assert.equal((await request('/nodes/' + createdId)).body.data.verification_count, 0);
  const row = await pool.query(
    'SELECT COUNT(*)::int AS count FROM verifications WHERE node_id=$1',
    [createdId],
  );
  assert.equal(row.rows[0].count, 0);
});
test('comments validate text, use authenticated identity and update real counts', async () => {
  assert.equal(
    (await request('/nodes/' + createdId + '/comments', { method: 'POST', body: { text: ' ' } }))
      .status,
    400,
  );
  const result = await request('/nodes/' + createdId + '/comments', {
    method: 'POST',
    auth: otherToken,
    body: { text: 'This clarification is helpful.', authorName: 'Impersonation' },
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.data.author_name, 'Integration Student');
  assert.equal((await request('/nodes/' + createdId)).body.data.comment_count, 1);
  assert.equal((await request('/nodes/' + createdId + '/comments')).body.data.length, 1);
});
test('RSVPs are idempotent and restricted to events', async () => {
  assert.equal((await request('/nodes/' + createdId + '/rsvp', { method: 'PUT' })).status, 404);
  for (let i = 0; i < 2; i++)
    assert.equal((await request('/nodes/1/rsvp', { method: 'PUT' })).status, 200);
  const node = await request('/nodes/1');
  assert.equal(node.body.data.is_attending, true);
  assert.equal(node.body.data.attendee_count, 1);
  await request('/nodes/1/rsvp', { method: 'DELETE' });
  assert.equal((await request('/nodes/1')).body.data.attendee_count, 0);
});
test('ownership protects removal; removed contributions disappear from public endpoints', async () => {
  assert.equal(
    (await request('/nodes/' + createdId, { method: 'DELETE', auth: otherToken })).status,
    403,
  );
  assert.equal((await request('/nodes/' + createdId, { method: 'DELETE' })).status, 200);
  assert.equal((await request('/nodes/' + createdId)).status, 404);
  assert.equal((await request('/nodes/' + createdId + '/comments')).status, 404);
  assert.equal((await request('/nodes/' + createdId + '/bookmark', { method: 'PUT' })).status, 404);
  assert.equal(
    (
      await request('/nodes/' + createdId + '/comments', {
        method: 'POST',
        body: { text: 'Cannot post here.' },
      })
    ).status,
    404,
  );
});
test('security headers and CORS do not trust arbitrary origins', async () => {
  for (const jwtSecret of ['', 'replace_with_a_unique_random_secret_at_least_32_characters']) {
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', "await import('./src/config/security.js')"],
      {
        cwd: new URL('../', import.meta.url),
        env: { ...process.env, NODE_ENV: 'production', DB_MODE: 'postgres', JWT_SECRET: jwtSecret },
        encoding: 'utf8',
      },
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Production requires/);
  }
  const allowed = await request('/health', { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const denied = await request('/health', { headers: { Origin: 'https://untrusted.example' } });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  assert.equal(denied.headers.get('x-powered-by'), null);
  assert.ok(denied.headers.get('x-request-id'));
  assert.equal(denied.headers.get('x-content-type-options'), 'nosniff');
});
