import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import configFactory from '../vite.config.js';

const root = fileURLToPath(new URL('../', import.meta.url));
process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = 'cors-test-only-not-a-deployment-secret-123456';
process.env.CLIENT_ORIGIN = 'http://localhost:5180';
const { default: app } = await import('../../Back-END/index.js');
const backend = app.listen(0, '127.0.0.1');
await once(backend, 'listening');
const temp = await mkdtemp(path.join(tmpdir(), 'jobelza-proxy-test-'));
const cwd = process.cwd();
const originalTarget = process.env.VITE_PROXY_TARGET;
let vite;
try {
  delete process.env.VITE_PROXY_TARGET;
  const target = `http://127.0.0.1:${backend.address().port}`;
  await writeFile(path.join(temp, '.env'), `VITE_PROXY_TARGET=${target}\nVITE_API_URL=/api\n`);
  process.chdir(temp);
  const config = configFactory({ mode: 'development' });
  process.chdir(cwd);
  assert.equal(config.server.proxy['/api'].target, target, '.env must be loaded');
  assert.equal(config.server.strictPort, true);
  assert.equal(config.preview.strictPort, true);
  vite = await createServer({ ...config, configFile: false, root, server: { ...config.server, host: '127.0.0.1', port: 0, open: false } });
  await vite.listen();
  const base = `http://127.0.0.1:${vite.httpServer.address().port}`;
  for (const origin of ['http://localhost:5180', 'https://untrusted.example']) {
    const response = await fetch(`${base}/api/auth/register`, {
      method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}',
    });
    assert.equal(response.status, origin.includes('localhost') ? 400 : 403);
    assert.equal((await response.json()).message, origin.includes('localhost') ? 'Validation failed' : 'Origin not allowed');
  }
  console.log('PASS: .env target loaded, strict ports, real Vite proxy to Express, Origin preserved and enforced.');
} finally {
  process.chdir(cwd);
  if (originalTarget === undefined) delete process.env.VITE_PROXY_TARGET;
  else process.env.VITE_PROXY_TARGET = originalTarget;
  if (vite) await vite.close();
  await new Promise(resolve => backend.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
