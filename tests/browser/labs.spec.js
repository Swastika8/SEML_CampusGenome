const { test, expect } = require('@playwright/test');

const labsHeading = (page) =>
  page.getByRole('heading', { name: 'Curiosity looks good on you.', exact: true });
const draftToggle = (page) => page.getByRole('checkbox', { name: /^Draft rescue/ });
const remaining = (page) => page.getByRole('timer', { name: 'Focus time remaining' });

async function account(request) {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const response = await request.post('/api/auth/register', {
    data: {
      name: 'Labs Student ' + suffix,
      handle: 'labs_' + suffix,
      email: 'labs.' + suffix + '@campus.test',
      password: 'LabsPassword123',
      department: 'IT',
    },
  });
  expect(response.ok(), 'isolated Labs account registration').toBe(true);
  return response.json();
}

const authorization = (student) => ({ Authorization: 'Bearer ' + student.token });

async function session(page, student) {
  await page.goto('/login');
  await page.evaluate((token) => {
    for (const store of [localStorage, sessionStorage]) {
      store.removeItem('campus_token');
      store.removeItem('campus_user');
    }
    sessionStorage.setItem('campus_token', token);
  }, student.token);
  const restored = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/auth/me') &&
      response.status() === 200 &&
      response.request().headers().authorization === 'Bearer ' + student.token,
  );
  await page.goto('/labs');
  const response = await restored;
  expect((await response.json()).user.id).toBe(student.user.id);
  await expect(labsHeading(page)).toBeVisible();
  await expect(draftToggle(page)).toBeEnabled();
}

async function createPost(request, student, title, extra = {}) {
  const response = await request.post('/api/nodes', {
    headers: authorization(student),
    data: {
      category: 'Academics',
      title,
      description: 'A useful isolated contribution for the Campus Labs browser checks.',
      department: 'IT',
      year: 'TY',
      ...extra,
    },
  });
  expect(response.status(), 'create isolated Labs contribution').toBe(201);
  return (await response.json()).data;
}

async function save(request, student, node) {
  const response = await request.put('/api/nodes/' + node.id + '/bookmark', {
    headers: authorization(student),
  });
  expect(response.ok()).toBe(true);
}

async function rsvp(request, student, node) {
  const response = await request.put('/api/nodes/' + node.id + '/rsvp', {
    headers: authorization(student),
  });
  expect(response.ok()).toBe(true);
}

async function downloadText(page, buttonName) {
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: buttonName, exact: true }).click();
  const download = await downloading;
  expect(await download.failure()).toBeNull();
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return { text: Buffer.concat(chunks).toString('utf8'), name: download.suggestedFilename() };
}

async function contribute(page) {
  await page
    .locator('header')
    .getByRole('button', { name: /Contribute/ })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}

async function fillAcademic(dialog, title) {
  await dialog.getByLabel('Give it a clear title').fill(title);
  await dialog
    .getByLabel('Share the details')
    .fill('Keep this useful explanation safe until the contribution has actually been published.');
  await dialog.getByLabel('Department', { exact: true }).fill('IT');
  await dialog.getByLabel('Study year', { exact: true }).fill('TY');
}

const campusDate = (offset = 28) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

test('Labs guests can preview the nook without exporting private data or writing to the API', async ({
  page,
}) => {
  const writes = [];
  const exportRequests = [];
  page.on('request', (request) => {
    if (!request.url().includes('/api/')) return;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.url());
    if (request.url().includes('/api/labs/')) exportRequests.push(request.url());
  });
  await page.goto('/labs');
  await expect(labsHeading(page)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A little focus nook.' })).toBeVisible();
  for (const name of ['Download Pocket JSON', 'Download Pocket notes', 'Download RSVP calendar']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled();
  }
  await expect(draftToggle(page)).toBeDisabled();
  await expect(
    page.getByRole('link', { name: 'Sign in to try the Labs', exact: true }),
  ).toBeVisible();
  expect(writes).toEqual([]);
  expect(exportRequests).toEqual([]);
});

test("Pocket JSON and notes download only this account's saved visible finds", async ({
  page,
  request,
}) => {
  const student = await account(request);
  const peer = await account(request);
  const mine = await createPost(request, peer, 'A saved Labs guide');
  const theirs = await createPost(request, student, 'A different account private save');
  const unsaved = await createPost(request, student, 'A guide this account did not save');
  await save(request, student, mine);
  await save(request, peer, theirs);
  await session(page, student);

  const json = await downloadText(page, 'Download Pocket JSON');
  expect(json.name).toMatch(/\.json$/i);
  const parsed = JSON.parse(json.text);
  const pocket = parsed.data || parsed;
  expect(pocket.count).toBe(1);
  expect(pocket.items.map((item) => item.id)).toEqual([mine.id]);
  expect(pocket.items[0]).toMatchObject({ title: mine.title, path: '/nodes/' + mine.id });
  expect(json.text).not.toContain(theirs.title);
  expect(json.text).not.toContain(unsaved.title);

  const notes = await downloadText(page, 'Download Pocket notes');
  expect(notes.name).toMatch(/\.(md|markdown)$/i);
  expect(notes.text).toContain(mine.title);
  expect(notes.text).toContain('/nodes/' + mine.id);
  expect(notes.text).not.toContain(theirs.title);
  expect(notes.text).not.toContain(unsaved.title);
  await page.goto('/');
  await page.getByLabel('Open account menu', { exact: true }).click();
  await page.getByRole('banner').getByRole('link', { name: 'Campus Labs', exact: true }).click();
  await expect(labsHeading(page)).toBeVisible();
});

test("the RSVP calendar downloads this account's all-day events with exclusive end dates", async ({
  page,
  request,
}) => {
  const student = await account(request);
  const peer = await account(request);
  const eventDate = campusDate();
  const mine = await createPost(request, peer, 'My Labs calendar session', {
    category: 'Events',
    eventDate,
    eventTime: '4:00 PM',
    eventLocation: 'Library seminar room',
  });
  const theirs = await createPost(request, student, 'Another account RSVP only', {
    category: 'Events',
    eventDate,
  });
  await rsvp(request, student, mine);
  await rsvp(request, peer, theirs);
  await session(page, student);
  const calendar = await downloadText(page, 'Download RSVP calendar');
  const text = calendar.text.replace(/\r?\n[ \t]/g, '');
  const nextDay = new Date(eventDate + 'T00:00:00Z');
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  expect(calendar.name).toMatch(/\.ics$/i);
  expect(text).toContain('BEGIN:VCALENDAR');
  expect(text.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  expect(text).toContain('SUMMARY:' + mine.title);
  expect(text).toContain('DTSTART;VALUE=DATE:' + eventDate.replaceAll('-', ''));
  expect(text).toContain(
    'DTEND;VALUE=DATE:' + nextDay.toISOString().slice(0, 10).replaceAll('-', ''),
  );
  expect(text).not.toContain(theirs.title);
  expect(text).not.toContain('DTSTART;TZID=');
});

test('focus time survives reload, pauses accurately and remains separate between accounts', async ({
  page,
  request,
}) => {
  const student = await account(request);
  const peer = await account(request);
  const time = (seconds) => new Date(Date.UTC(2031, 0, 1, 0, 0, seconds));
  await page.clock.setFixedTime(time(0));
  await session(page, student);
  await expect(remaining(page)).toHaveText('25:00');
  await page.getByRole('button', { name: '50 min', exact: true }).click();
  await expect(remaining(page)).toHaveText('50:00');
  await page.getByRole('button', { name: '5 min', exact: true }).click();
  await page.getByRole('button', { name: 'Start focus', exact: true }).click();
  await expect(page.getByText('Focus is running.', { exact: true })).toBeVisible();
  await page.clock.setFixedTime(time(4));
  await expect(remaining(page)).toHaveText('04:56');
  await page.reload();
  await expect(page.getByText('Focus is running.', { exact: true })).toBeVisible();
  await expect(remaining(page)).toHaveText('04:56');
  await page.getByRole('button', { name: 'Pause focus', exact: true }).click();
  await expect(page.getByText('Focus is paused.', { exact: true })).toBeVisible();
  await page.clock.setFixedTime(time(64));
  await page.reload();
  await expect(remaining(page)).toHaveText('04:56');
  await expect(page.getByRole('button', { name: 'Resume focus', exact: true })).toBeVisible();

  await session(page, peer);
  await expect(remaining(page)).toHaveText('25:00');
  await session(page, student);
  await expect(remaining(page)).toHaveText('04:56');
  await page.getByRole('button', { name: 'Reset focus', exact: true }).click();
  await expect(remaining(page)).toHaveText('05:00');
  await page.getByRole('button', { name: 'Start focus', exact: true }).click();
  await page.clock.setFixedTime(time(364));
  await expect(remaining(page)).toHaveText('00:00');
  await expect(page.getByText('One small thing, done.', { exact: true })).toBeVisible();
});

test('draft rescue is off by default and does not silently retain contribution content', async ({
  page,
  request,
}) => {
  await session(page, await account(request));
  await expect(draftToggle(page)).not.toBeChecked();
  let dialog = await contribute(page);
  await fillAcademic(dialog, 'This contribution was not opted into rescue');
  await page.reload();
  dialog = await contribute(page);
  await expect(dialog.getByRole('button', { name: 'Restore draft', exact: true })).toHaveCount(0);
  await expect(dialog.getByLabel('Give it a clear title')).toHaveValue('');
  await expect(dialog.getByLabel('Share the details')).toHaveValue('');
});

test('opt-in drafts restore category fields, stay account-private and clear when disabled', async ({
  page,
  request,
}) => {
  const student = await account(request);
  const peer = await account(request);
  await session(page, student);
  await draftToggle(page).check();
  let dialog = await contribute(page);
  await dialog.getByRole('button', { name: 'Events', exact: true }).click();
  await dialog.getByLabel('Give it a clear title').fill('A rescued Labs workshop draft');
  await dialog
    .getByLabel('Share the details')
    .fill('Bring your campus questions to a practical workshop.');
  const eventDate = campusDate(30);
  await dialog.getByLabel('Event date').fill(eventDate);
  await dialog.getByLabel('Time', { exact: true }).fill('3:30 PM');
  await dialog.getByLabel('Venue', { exact: true }).fill('Workshop room 4');
  await expect(dialog).toContainText('Draft kept on this device.');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A rescued Labs workshop draft', exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Continue draft', exact: true }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('A draft is waiting on this device.');
  await expect(dialog.getByLabel('Give it a clear title')).toBeDisabled();
  await dialog.getByRole('button', { name: 'Restore draft', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Events', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(dialog.getByLabel('Give it a clear title')).toHaveValue(
    'A rescued Labs workshop draft',
  );
  await expect(dialog.getByLabel('Event date')).toHaveValue(eventDate);
  await expect(dialog.getByLabel('Time', { exact: true })).toHaveValue('3:30 PM');
  await expect(dialog.getByLabel('Venue', { exact: true })).toHaveValue('Workshop room 4');

  await session(page, peer);
  await expect(draftToggle(page)).not.toBeChecked();
  dialog = await contribute(page);
  await expect(dialog).not.toContainText('A draft is waiting on this device.');
  await expect(dialog.getByLabel('Give it a clear title')).toHaveValue('');
  await session(page, student);
  await expect(draftToggle(page)).toBeChecked();
  dialog = await contribute(page);
  await expect(dialog.getByRole('button', { name: 'Restore draft', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Restore draft', exact: true }).click();
  await expect(dialog.getByLabel('Give it a clear title')).toHaveValue(
    'A rescued Labs workshop draft',
  );
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await draftToggle(page).uncheck();
  await page.reload();
  dialog = await contribute(page);
  await expect(dialog.getByRole('button', { name: 'Restore draft', exact: true })).toHaveCount(0);
  await expect(dialog.getByLabel('Give it a clear title')).toHaveValue('');
});

test('a rejected publish retains its rescued draft and a successful publish clears it', async ({
  page,
  request,
}) => {
  await session(page, await account(request));
  await draftToggle(page).check();
  let dialog = await contribute(page);
  await fillAcademic(dialog, 'A draft that survives a failed publish');
  const rejectPublish = (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Isolated publish unavailable.' }),
        })
      : route.continue();
  await page.route('**/api/nodes', rejectPublish);
  await dialog.getByRole('button', { name: 'Share with the collective', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Isolated publish unavailable.');
  await page.reload();
  dialog = await contribute(page);
  await dialog.getByRole('button', { name: 'Restore draft', exact: true }).click();
  await expect(dialog.getByLabel('Give it a clear title')).toHaveValue(
    'A draft that survives a failed publish',
  );
  await page.unroute('**/api/nodes', rejectPublish);
  await dialog.getByRole('button', { name: 'Share with the collective', exact: true }).click();
  await expect(dialog).toContainText('Your insight is part of the collective.');
  await dialog.getByRole('button', { name: 'View your contribution', exact: true }).click();
  await expect(page.locator('.article h1')).toHaveText('A draft that survives a failed publish');
  await page.goto('/labs');
  await page.reload();
  dialog = await contribute(page);
  await expect(dialog.getByRole('button', { name: 'Restore draft', exact: true })).toHaveCount(0);
  await expect(dialog.getByLabel('Give it a clear title')).toHaveValue('');
});

test('Labs controls remain readable at narrow widths and preserve the midnight theme', async ({
  page,
  request,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await session(page, await account(request));
  await page.getByRole('button', { name: 'Toggle Theme', exact: true }).click();
  await expect(page.locator('html')).toHaveClass('dark');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.reload();
    await expect(labsHeading(page)).toBeVisible();
    await expect(page.locator('html')).toHaveClass('dark');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
    await expect(
      page.getByRole('button', { name: 'Download Pocket JSON', exact: true }),
    ).toBeEnabled();
    await expect(draftToggle(page)).toBeEnabled();
  }
  expect(errors).toEqual([]);
});
