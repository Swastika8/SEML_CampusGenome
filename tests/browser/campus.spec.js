const { test, expect } = require('@playwright/test');

async function studentSession(page, request) {
  const response = await request.post('/api/auth/demo');
  const { token } = await response.json();
  await page.addInitScript((value) => sessionStorage.setItem('campus_token', value), token);
}
const hero = (page) => page.getByRole('heading', { name: 'Every college has hidden knowledge.' });

test('original campus screens and academic drilldown work without errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const route of [
    '/',
    '/academics',
    '/career',
    '/communities',
    '/events',
    '/lifestyle',
    '/map',
    '/explore',
  ]) {
    await page.goto(route);
    await expect(page.locator('#main-content')).toBeVisible();
    await expect(page.getByText("Let's find our way back.")).toHaveCount(0);
    if (route === '/') await expect(hero(page)).toBeVisible();
    if (route === '/lifestyle')
      await expect(
        page.getByRole('heading', { name: 'Midnight Maggi & Cutting Chai' }),
      ).toBeVisible();
  }
  await page.goto('/academics');
  await page.getByRole('button', { name: 'Explore IT academics' }).click();
  await page.getByRole('button', { name: 'Explore SY guides' }).click();
  await expect(
    page.getByRole('heading', { name: 'IT - SY Insights: Data Structures & Algorithms' }),
  ).toBeVisible();
  await page.goto('/');
  await page.getByRole('button', { name: 'Take a campus tour' }).click();
  await expect(page.getByText('Start your journey here.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Skip', exact: true }).click();
  await page.getByRole('button', { name: 'Take a campus tour' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(
    page.getByText('Switch between light and dark modes', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Last', exact: true }).click();
  await expect(page.getByText('Switch between light and dark modes', { exact: false })).toHaveCount(
    0,
  );
  expect(errors).toEqual([]);
});

test('original sign-in design creates a real demo session and signs out', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Try the student demo' }).click();
  await expect(hero(page)).toBeVisible();
  await expect(page.locator('aside').getByText('John Doe', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => !!sessionStorage.getItem('campus_token'))).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('campus_token'))).toBeNull();
  await page.locator('aside button[title="Log Out"]').click();
  await expect(page).toHaveURL(/\/login$/);
});

test('gold contribution flow publishes, discusses and removes a real strand', async ({
  page,
  request,
}) => {
  await studentSession(page, request);
  await page.goto('/');
  await page
    .locator('header')
    .getByRole('button', { name: /Contribute/ })
    .click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Give it a clear title').fill('A better way to revise databases');
  await dialog
    .getByLabel('Share the details')
    .fill('Start with the schema, draw the relationships, and practice joins on a real dataset.');
  await dialog.getByLabel('Department', { exact: true }).fill('CS');
  await dialog.getByRole('button', { name: 'Share with the collective' }).click();
  await expect(dialog).toContainText('Your insight is part of the collective.');
  await dialog.getByRole('button', { name: 'View your contribution' }).click();
  await expect(page.locator('.article h1')).toHaveText('A better way to revise databases');
  const id = page.url().split('/').pop();
  await page.getByLabel('Add your perspective').fill('Explain why each join returns those rows.');
  await page.getByRole('button', { name: 'Post comment' }).click();
  await expect(page.locator('.comments-list')).toContainText('Explain why each join');
  await page.reload();
  await expect(page.locator('.comments-list')).toContainText('Explain why each join');
  await page.getByRole('button', { name: 'Remove', exact: true }).click();
  await page.getByRole('button', { name: 'Remove contribution', exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  expect((await request.get('/api/nodes/' + id)).status()).toBe(404);
});

test('pocketed finds survive reload and remain in the private pocket', async ({
  page,
  request,
}) => {
  await studentSession(page, request);
  await page.goto('/nodes/22');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
  await page.goto('/saved');
  await expect(page.locator('.node-card')).toContainText('Mountaineering Expedition Group');
  await page.getByRole('button', { name: /Unsave Mountaineering/ }).click();
  await expect(page.locator('.node-card')).toHaveCount(0);
});

test('event RSVPs and peer verifications reflect the server', async ({ page, request }) => {
  await studentSession(page, request);
  await page.goto('/nodes/1');
  await page.getByRole('button', { name: 'Count me in' }).click();
  await expect(page.locator('.rsvp-box')).toContainText('You’re on the list');
  await page.reload();
  await expect(page.locator('.rsvp-box')).toContainText('1 student has RSVPed');
  await page.getByRole('button', { name: 'Cancel RSVP' }).click();
  await expect(page.getByRole('button', { name: 'Count me in' })).toBeVisible();
  await page.getByRole('button', { name: /^Verified/ }).click();
  await expect(page.getByRole('button', { name: /^Verify ·/ })).toBeVisible();
  await page.getByRole('button', { name: /^Verify ·/ }).click();
  await expect(page.getByRole('button', { name: /^Verified/ })).toBeVisible();
});

test('the original floating search supports the keyboard shortcut and real results', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  const search = page.getByRole('textbox', { name: 'Search campus knowledge' });
  await expect(search).toBeFocused();
  await search.fill('Maggi');
  await page
    .locator('.header-search')
    .getByText('Midnight Maggi & Cutting Chai', { exact: true })
    .click();
  await expect(page.locator('.article h1')).toHaveText('Midnight Maggi & Cutting Chai');
  await page.keyboard.press('Control+k');
  await search.fill('Maggi');
  await page.keyboard.press('Escape');
  await expect(page.getByText('Campus Search Results')).toHaveCount(0);
});

test('original registration form and remembered sign-in work', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Create an Account/i }).click();
  await page.getByLabel('Your name', { exact: true }).fill('Browser Student');
  await page.getByLabel('Choose a handle').fill('browser_student');
  await page.getByLabel('Campus email').fill('browser@campus.edu');
  await page.getByLabel('Password', { exact: true }).fill('browserPassword123');
  await page.getByRole('button', { name: 'Create Student Account' }).click();
  await expect(hero(page)).toBeVisible();
  await expect(page.locator('aside').getByText('Browser Student', { exact: true })).toBeVisible();
  await page.locator('aside button[title="Log Out"]').click();
  await page.getByLabel('Email or campus handle').fill('browser@campus.edu');
  await page.getByLabel('Password', { exact: true }).fill('browserPassword123');
  await page.getByLabel('Remember this device').check();
  await page.getByRole('button', { name: 'Sign In to CampusGenome' }).click();
  await expect(hero(page)).toBeVisible();
  expect(await page.evaluate(() => !!localStorage.getItem('campus_token'))).toBe(true);
});

test('original icon rail and restored layouts fit mobile through desktop', async ({ page }) => {
  test.setTimeout(60000);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/explore', '/map', '/login']) {
      await page.goto(route);
      await expect(page.locator('h1:visible').first()).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
        width + ' ' + route,
      ).toBeLessThanOrEqual(1);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Expand navigation' }).click();
  await page.getByRole('link', { name: 'My Pocket', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your pocket universe.' })).toBeVisible();
});

test('midnight preference persists and guests sign in before saving', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Toggle Theme' }).click();
  await expect(page.locator('html')).toHaveClass('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveClass('dark');
  await page.goto('/nodes/22');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('the daily capsule reveals real finds and shuffles to a different strand', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Crack today's capsule" }).click();
  const reveal = page.locator('.capsule-reveal');
  await expect(reveal).toBeVisible();
  const first = await reveal.locator('h3').innerText();
  await page.getByRole('button', { name: 'Shuffle the DNA' }).click();
  await expect(reveal.locator('h3')).not.toHaveText(first);
  const selected = await reveal.locator('h3').innerText();
  await page.getByRole('link', { name: 'Follow this strand' }).click();
  await expect(page.locator('.article h1')).toHaveText(selected);
});

test('side quests advance only after an actual pocket save', async ({ page, request }) => {
  await studentSession(page, request);
  await page.goto('/');
  const progress = page.getByRole('progressbar', { name: 'Completed campus side quests' });
  await expect(progress).toHaveAttribute('aria-valuenow', '1');
  await page.getByRole('button', { name: "Crack today's capsule" }).click();
  await page
    .locator('.capsule-reveal')
    .getByRole('button', { name: /^Pocket / })
    .click();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
  await expect(page.locator('.quest-row.complete')).toHaveCount(2);
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '2');
});

test('the original gold discussion modal saves comments through the API', async ({
  page,
  request,
}) => {
  await studentSession(page, request);
  await page.goto('/communities');
  const card = page
    .getByRole('heading', { name: 'Mountaineering Expedition Group' })
    .locator('..')
    .locator('..');
  await card.getByRole('button', { name: /Comments?$/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Mountaineering Expedition Group discussion' });
  await dialog.getByLabel('Add your perspective').fill('Does the next trek have a beginner route?');
  await dialog.getByRole('button', { name: 'Post comment' }).click();
  await expect(dialog).toContainText('Does the next trek have a beginner route?');
  await dialog.getByTitle('Close (Esc)').click();
  await page.reload();
  await card.getByRole('button', { name: /Comments?$/ }).click();
  await expect(dialog).toContainText('Does the next trek have a beginner route?');
});

test('common room channels sort real posts and helpful votes persist', async ({
  page,
  request,
}) => {
  await studentSession(page, request);
  await page.goto('/');
  const feed = page.getByRole('region', { name: 'Campus conversation feed' });
  await feed.getByRole('button', { name: 'After class', exact: true }).click();
  await expect(feed.locator('.thread-list')).toHaveAttribute('aria-busy', 'false');
  await expect(feed.locator('.thread-card')).toHaveCount(5);
  await expect(feed.locator('.thread-channel').first()).toHaveText('g/after-class');
  const sorted = page.waitForResponse(
    (res) =>
      res.url().includes('/api/nodes?') &&
      res.url().includes('sort=recent') &&
      res.url().includes('category=Lifestyle'),
  );
  await feed.getByRole('button', { name: 'Fresh', exact: true }).click();
  await sorted;
  await expect(feed.locator('.thread-list')).toHaveAttribute('aria-busy', 'false');
  const post = feed
    .locator('.thread-card')
    .filter({ has: page.getByRole('heading', { name: 'The Botanical Quad', exact: true }) });
  const vote = post.locator('.thread-vote button');
  const before = await vote.getAttribute('aria-pressed');
  await vote.click();
  await expect(vote).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true');
  await page.reload();
  await feed.getByRole('button', { name: 'After class', exact: true }).click();
  await expect(vote).toHaveAttribute('aria-pressed', before === 'true' ? 'false' : 'true');
});

test('campus field guide stays readable and pins authenticated notes', async ({
  page,
  request,
}) => {
  await studentSession(page, request);
  for (const width of [390, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/map');
    await page.getByRole('button', { name: 'Central Library', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Central Library details' })).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Central Library', exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
    ).toBeLessThanOrEqual(1);
    const panel = await page.locator('.place-panel').boundingBox();
    expect(panel.width).toBeGreaterThan(240);
  }
  await page.getByRole('tab', { name: /Field notes/ }).click();
  await page
    .getByLabel('Leave a field note')
    .fill('Browser field note: bring headphones for the afternoon study session.');
  await page.getByRole('button', { name: 'Pin a field note', exact: true }).click();
  await expect(page.locator('.field-notes-list')).toContainText(
    'Browser field note: bring headphones',
  );
  await page.reload();
  await page.getByRole('tab', { name: /Field notes/ }).click();
  await expect(page.locator('.field-notes-list')).toContainText(
    'Browser field note: bring headphones',
  );
  await expect(page.locator('.field-notes-list')).toContainText('@StudentJohn');
  await page.getByRole('button', { name: 'Close place details' }).click();
  await expect(page.locator('.place-panel')).toHaveCount(0);
});
