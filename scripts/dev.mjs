import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
function launch(args, cwd = root, environment = {}) {
  const child = spawn(process.execPath, args, {
    cwd,
    stdio: 'inherit',
    windowsHide: true,
    env: { ...process.env, ...environment },
  });
  children.push(child);
  child.on('error', (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping) stop(code || 0);
  });
  return child;
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
const port = Number(process.env.PORT || 5000);
launch(['backend/src/server.js', '--demo'], root, { PORT: String(port) });
let ready = false;
for (let attempt = 0; attempt < 120 && !stopping; attempt++) {
  try {
    const response = await fetch('http://127.0.0.1:' + port + '/api/health', {
      signal: AbortSignal.timeout(500),
    });
    if (response.ok) {
      ready = true;
      break;
    }
  } catch {
    /* Give the embedded PostgreSQL engine time to initialize. */
  }
  await new Promise((resolve) => setTimeout(resolve, 250));
}
if (ready && !stopping) {
  launch(
    [fileURLToPath(new URL('../frontend/node_modules/vite/bin/vite.js', import.meta.url))],
    fileURLToPath(new URL('../frontend/', import.meta.url)),
    { API_PROXY_TARGET: 'http://127.0.0.1:' + port },
  );
} else if (!stopping) {
  console.error('The API did not become ready. Check the startup message above.');
  stop(1);
}
