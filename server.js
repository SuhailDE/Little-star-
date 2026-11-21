import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './server/app.js';
import { connectDatabase } from './server/config/db.js';
import { env } from './server/config/env.js';
import { ensureInitialDataSeeded } from './server/scripts/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  await connectDatabase();
  await ensureInitialDataSeeded();

  const app = createExpressApp();

  if (!env.isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distDir, 'index.html'));
      });
    }
  }

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`[Server] Little Star running on http://0.0.0.0:${env.port} (${env.nodeEnv})`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
