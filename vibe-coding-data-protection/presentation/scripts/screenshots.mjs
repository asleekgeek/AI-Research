#!/usr/bin/env node
// Screenshots every slide of dist/index.html at desktop and phone width, light and dark.
// Usage: node scripts/screenshots.mjs [outDir] [slug ...]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(process.argv[2] ?? join(here, '..', 'test-results', 'shots'));
const only = process.argv.slice(3);
const url = pathToFileURL(join(here, '..', 'dist', 'index.html')).href;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const variants = [
  { name: 'desk-light', viewport: { width: 1440, height: 900 }, scheme: 'light' },
  { name: 'desk-dark', viewport: { width: 1440, height: 900 }, scheme: 'dark' },
  { name: 'phone-light', viewport: { width: 390, height: 844 }, scheme: 'light' },
  { name: 'phone-dark', viewport: { width: 390, height: 844 }, scheme: 'dark' },
];
const wanted = (process.env.VARIANTS ?? '').split(',').filter(Boolean);
for (const v of variants.filter((x) => !wanted.length || wanted.includes(x.name))) {
  const ctx = await browser.newContext({ viewport: v.viewport, colorScheme: v.scheme, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error(`[${v.name}] pageerror`, e.message));
  page.on('console', (m) => m.type() === 'error' && console.error(`[${v.name}] console`, m.text()));
  await page.goto(url);
  const slugs = only.length ? only : await page.evaluate(() => window.__slugs ?? []);
  for (const slug of slugs) {
    await page.evaluate((s) => (location.hash = s), slug);
    await page.waitForFunction((s) => document.querySelector('.slide')?.getAttribute('data-slug') === s, slug);
    await page.waitForTimeout(120);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) console.error(`[${v.name}] ${slug}: horizontal overflow ${overflow}px`);
    await page.screenshot({ path: join(out, `${slug}--${v.name}.png`), fullPage: process.env.FULL === '1' });
  }
  await ctx.close();
}
await browser.close();
console.log(`screenshots in ${out}`);
