const { test, expect } = require('@playwright/test');

async function makeStudent(request, label) {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const response = await request.post('/api/auth/register', {
    data: {
      name: label,
      handle: 'forum_' + suffix,
      email: suffix + '@campus.test',
      password: 'ForumTestPassword123',
    },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).token;
}

async function setupSession(page, token) {
  await page.addInitScript((value) => sessionStorage.setItem('campus_token', value), token);
}

function postCard(page, title) {
  return page
    .locator('.forum-post')
    .filter({ has: page.getByRole('heading', { name: title, exact: true }) });
}

async function createPost(request, auth, title, communitySlug) {
  const response = await request.post('/api/nodes', {
    headers: { Authorization: 'Bearer ' + auth },
    data: {
      category: 'Discussion',
      title,
      description: 'A real discussion for the isolated forum browser test.',
      communitySlug,
    },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).data.id;
}

test('create a university community, publish to it and build a following feed', async ({
  page,
  request,
}) => {
  await setupSession(page, await makeStudent(request, 'Forum organizer'));
  await page.goto('/communities');
  await page.locator('main').getByRole('button', { name: 'Create community', exact: true }).click();
  const group = page.getByRole('dialog', { name: 'Create a community' });
  await group.getByLabel('Community name', { exact: true }).fill('Robotics Table');
  await expect(group.getByLabel('Community address')).toHaveValue('robotics-table');
  await group.getByLabel('University or campus').fill('North Campus University');
  await group
    .getByLabel('Description')
    .fill('A place to plan student robotics projects and share parts.');
  await group.getByRole('button', { name: 'Create community', exact: true }).click();
  await expect(page).toHaveURL(/\/c\/robotics-table$/);
  await expect(page.getByRole('heading', { name: 'Robotics Table' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Leave g/robotics-table' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page
    .locator('.forum-community-heading')
    .getByRole('button', { name: 'Create post', exact: true })
    .click();
  const draft = page.getByRole('dialog', { name: 'Create a post', exact: true });
  await expect(draft.getByLabel('Post in')).toHaveValue('robotics-table');
  await draft.getByLabel('Post type').selectOption('Question');
  const title = 'Anyone building a line-following robot?';
  await draft.getByLabel('Give it a clear title').fill(title);
  await draft
    .getByLabel('Share the details')
    .fill('I am choosing a beginner-friendly sensor and could use a second opinion.');
  await draft.getByRole('button', { name: 'Publish post', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'A little knowledge, passed on.' })
    .getByRole('button', { name: 'View your contribution' })
    .click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await expect(page.locator('.forum-thread .forum-kind')).toHaveText('Question');
  await page
    .getByRole('navigation', { name: 'Campus navigation' })
    .getByRole('link', { name: 'Following', exact: true })
    .click();
  await expect(postCard(page, title)).toBeVisible();
  await page.reload();
  await expect(postCard(page, title)).toBeVisible();
  await page.goto('/c/robotics-table');
  await page.getByRole('button', { name: 'Leave g/robotics-table' }).click();
  await expect(page.getByRole('button', { name: 'Join g/robotics-table' })).toBeVisible();
  await page.goto('/?feed=following');
  await expect(
    page.getByRole('heading', { name: 'Your feed starts with a community' }),
  ).toBeVisible();
  await page.goto('/communities');
  await page.getByLabel('University or campus', { exact: true }).fill('North Campus University');
  await page
    .locator('.forum-directory-search')
    .getByRole('button', { name: 'Search', exact: true })
    .click();
  await expect(page.locator('.forum-directory-card')).toHaveCount(1);
  await expect(page.locator('.forum-directory-card')).toContainText('Robotics Table');
});

test('switch votes and keep replies nested and collapsible through reload', async ({
  page,
  request,
}) => {
  const author = await makeStudent(request, 'Thread author');
  await setupSession(page, await makeStudent(request, 'Thread participant'));
  const title = 'Best way to organize a study group?';
  const id = await createPost(request, author, title, 'campus');
  await page.goto('/nodes/' + id);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  const up = page.getByRole('button', { name: 'Upvote', exact: true });
  const down = page.getByRole('button', { name: 'Downvote', exact: true });
  await up.click();
  await expect(up).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Post score')).toHaveText('1');
  await down.click();
  await expect(down).toHaveAttribute('aria-pressed', 'true');
  await expect(up).toHaveAttribute('aria-pressed', 'false');
  await page.reload();
  await expect(down).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('Post score')).toHaveText('-1');
  await down.click();
  await expect(page.getByLabel('Post score')).toHaveText('0');

  await page
    .getByLabel('Add your perspective')
    .fill('Try a whiteboard and put the key questions up first.');
  await page.getByRole('button', { name: 'Post comment', exact: true }).click();
  const comment = page.locator('.forum-comment').filter({ hasText: 'Try a whiteboard' });
  await comment.getByRole('button', { name: 'Reply', exact: true }).click();
  await page.getByLabel('Write a reply').fill('That works well for keeping everyone involved.');
  await page.getByRole('button', { name: 'Post reply', exact: true }).click();
  const reply = page
    .locator('.forum-replies')
    .getByText('That works well for keeping everyone involved.');
  await expect(reply).toBeVisible();
  await page.reload();
  await expect(reply).toBeVisible();
  await comment.getByRole('button', { name: 'Hide replies' }).click();
  await expect(reply).toHaveCount(0);
  await comment.getByRole('button', { name: 'Show replies' }).click();
  await expect(reply).toBeVisible();
});

test('report a post and resolve it in its community owner’s queue', async ({ page, request }) => {
  const ownerToken = await makeStudent(request, 'Community moderator');
  const author = await makeStudent(request, 'A forum author');
  const reporter = await makeStudent(request, 'A forum reader');
  const slug = 'review-lounge';
  const group = await request.post('/api/forum/communities', {
    headers: { Authorization: 'Bearer ' + ownerToken },
    data: {
      slug,
      name: 'Review lounge',
      campus: 'Example University',
      description: 'A community for the isolated report review test.',
    },
  });
  expect(group.status()).toBe(201);
  const title = 'Post awaiting review';
  const id = await createPost(request, author, title, slug);
  await setupSession(page, reporter);
  await page.goto('/nodes/' + id);
  await page.getByLabel('Post options').click();
  await page.getByRole('button', { name: 'Report post', exact: true }).click();
  const report = page.getByRole('dialog', { name: 'Report post' });
  await report.getByLabel('Reason').selectOption('spam');
  await report.getByRole('button', { name: 'Send report', exact: true }).click();
  await expect(page.getByText('Report sent for review.')).toBeVisible();
  await page.reload();
  await page.getByLabel('Post options').click();
  await expect(page.getByRole('button', { name: 'Reported', exact: true })).toBeDisabled();
  await page.goto('/moderation');
  await expect(page.getByRole('heading', { name: 'Queue unavailable' })).toBeVisible();

  const moderator = await page.context().newPage();
  await setupSession(moderator, ownerToken);
  await moderator.goto('/c/' + slug);
  await moderator.getByRole('link', { name: 'Review reported posts' }).click();
  await expect(moderator.getByText('1 report · Spam')).toBeVisible();
  await expect(moderator.getByText('A forum reader', { exact: true })).toHaveCount(0);
  await moderator.getByRole('button', { name: 'Remove post', exact: true }).click();
  await moderator.getByRole('button', { name: 'Confirm removal', exact: true }).click();
  await expect(moderator.getByRole('heading', { name: 'You’re all caught up' })).toBeVisible();
  await page.goto('/nodes/' + id);
  await expect(page.getByRole('heading', { name: 'Post unavailable' })).toBeVisible();
});

test('mobile forum navigation keeps saved posts and campus tools within reach', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/communities');
  const navigation = page.getByRole('navigation', { name: 'Campus navigation' });
  const saved = navigation.getByRole('link', { name: 'Saved posts' });
  await expect(saved).toBeInViewport();
  await navigation.getByLabel('Campus tools').click();
  await expect(navigation.getByRole('link', { name: 'Campus extras' })).toBeVisible();
  await navigation.getByRole('link', { name: 'Campus map' }).click();
  await expect(page).toHaveURL(/\/map$/);
});
