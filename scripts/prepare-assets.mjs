import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public', 'original-69f121f04196b65f1ae09110d039806e.mp4');
const partsDir = path.join(root, '.encoded-assets');

try {
  const info = await stat(output);
  if (info.size > 0) process.exit(0);
} catch {}

const parts = (await readdir(partsDir))
  .filter((name) => name.startsWith('hero.mp4.b64.'))
  .sort();

if (!parts.length) {
  throw new Error('Missing encoded hero video parts.');
}

const encoded = (await Promise.all(parts.map((name) => readFile(path.join(partsDir, name), 'utf8')))).join('');
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, Buffer.from(encoded, 'base64'));
console.log(`Prepared ${path.relative(root, output)}`);
