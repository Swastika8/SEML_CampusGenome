const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  outputDir: 'tmp/playwright-results',
  use: {
    baseURL: 'http://127.0.0.1:5273',
    browserName: 'chromium',
    channel: process.platform === 'win32' ? 'msedge' : undefined,
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'node backend/src/server.js --demo',
      url: 'http://127.0.0.1:5100/api/health',
      timeout: 60000,
      env: {
        PORT: '5100',
        NODE_ENV: 'test',
        DEMO_DATA_DIR: 'memory://',
        API_RATE_LIMIT: '2000',
        JWT_SECRET: 'isolated-browser-test-secret-for-campus-genome',
      },
    },
    {
      command: 'node frontend/node_modules/vite/bin/vite.js frontend --port 5273 --strictPort',
      url: 'http://127.0.0.1:5273',
      timeout: 60000,
      env: { API_PROXY_TARGET: 'http://127.0.0.1:5100' },
    },
  ],
});
