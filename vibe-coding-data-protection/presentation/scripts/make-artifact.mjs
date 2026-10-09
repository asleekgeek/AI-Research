#!/usr/bin/env node
// Derives dist/artifact.html from dist/index.html for publishing as a claude.ai Artifact:
// the Artifact host supplies the <!doctype>/<html>/<head>/<body> skeleton itself, so strip ours
// and keep <title> first (the host only scans the first 8 KB for it).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
let html = readFileSync(join(dist, 'index.html'), 'utf8');
const title = /<title>[\s\S]*?<\/title>/.exec(html)?.[0] ?? '';
html = html
  .replace(/<!doctype html>/i, '')
  .replace(/<\/?html[^>]*>/gi, '')
  .replace(/<\/?head>/gi, '')
  .replace(/<\/?body[^>]*>/gi, '')
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '')
  .replace(title, '');
writeFileSync(join(dist, 'artifact.html'), `${title}\n${html.trim()}\n`);
console.log(`make-artifact: dist/artifact.html (${(html.length / 1024).toFixed(0)} KB)`);
