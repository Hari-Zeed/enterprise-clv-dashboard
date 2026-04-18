#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('[v0] Starting Prisma migration...');

const migrate = spawn('npx', ['prisma', 'db', 'push', '--skip-generate'], {
  cwd: dirname(__dirname),
  stdio: 'inherit',
  shell: true
});

migrate.on('close', (code) => {
  if (code === 0) {
    console.log('[v0] ✓ Database schema created successfully!');
    process.exit(0);
  } else {
    console.error('[v0] ✗ Migration failed with code:', code);
    process.exit(1);
  }
});

migrate.on('error', (err) => {
  console.error('[v0] Error running migration:', err);
  process.exit(1);
});
