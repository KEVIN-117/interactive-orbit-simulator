import { rm } from 'node:fs/promises';
// Resolve the known build output relative to this script, independently of cwd.
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
