import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const directory = fileURLToPath(new URL('../tmp/qa/', import.meta.url));
await mkdir(directory, { recursive: true });
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
const browser = await chromium.launch({
  channel: process.platform === 'win32' ? 'msedge' : undefined,
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: directory + 'dashboard-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.screenshot({ path: directory + 'dashboard-overview.png', animations: 'disabled' });
  await page
    .locator('.common-room-grid')
    .screenshot({ path: directory + 'common-room-feed.png', animations: 'disabled' });
  await page.getByRole('button', { name: "Crack today's capsule" }).click();
  await page.locator('.capsule-zone').screenshot({
    path: directory + 'campus-curiosity.png',
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Toggle Theme' }).click();
  await page.screenshot({ path: directory + 'dashboard-midnight.png', animations: 'disabled' });
  await page.getByRole('button', { name: 'Toggle Theme' }).click();
  await page.goto(base + '/map?building=b2', { waitUntil: 'networkidle' });
  await page.screenshot({ path: directory + 'map-desktop.png', animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: directory + 'map-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: directory + 'login-desktop.png', animations: 'disabled' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: directory + 'dashboard-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  console.log('Review screenshots saved in tmp/qa.');
} finally {
  await browser.close();
}
