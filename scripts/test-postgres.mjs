import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const child = spawn(process.execPath, ['--test', '--test-concurrency=1', 'test/api.test.js'], {
  cwd: fileURLToPath(new URL('../backend/', import.meta.url)),
  stdio: 'inherit',
  windowsHide: true,
  env: { ...process.env, CAMPUS_TEST_POSTGRES: '1' },
});
child.on('exit', (code) => {
  process.exitCode = code || 0;
});
child.on('error', (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
