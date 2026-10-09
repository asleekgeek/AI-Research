// End-to-end guards on the built single file (dist/index.html). Run `npm run build` first.
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(here, '..', 'dist', 'index.html')).href;
const corpus = new Set<string>(JSON.parse(readFileSync(join(here, '..', 'src', 'generated', 'corpus-numbers.json'), 'utf8')));
const keyFigures = JSON.parse(readFileSync(join(here, '..', '..', 'data', 'key-figures.json'), 'utf8')).rows as { source_url: string }[];

type Meta = { slug: string; section: string; paper: string[]; flags: { prop?: unknown; dated?: boolean; legal?: boolean } };

/** Paper sections that state vendor defaults, prices or regulatory status as of the date of record. */
const DATED_SECTIONS = ['4.2', '4.2.1', '4.2.2', '4.2.3', '4.3.2', '4.4.2', '4.5.3', '4.5.4', '4.5.5', '4.5.6', '4.6', '4.6.2', '7.1', '7.3', '7.4', '7.5', '7.6', '8.2', '11'];
/** Paper sections that are the authors' proposal throughout. */
const PROP_SECTIONS = ['8', '8.1', '8.2'];

async function open(page: Page, hash = '') {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && !/fonts\.g/.test(m.text()) && errors.push(m.text()));
  await page.goto(url + (hash ? `#${hash}` : ''));
  await page.waitForSelector('.slide');
  const meta: Meta[] = await page.evaluate(() => (window as any).__slides);
  return { errors, meta };
}

async function show(page: Page, slug: string) {
  await page.evaluate((s) => (location.hash = s), slug);
  await page.waitForFunction((s) => document.querySelector('.slide')?.getAttribute('data-slug') === s, slug);
}

test('every number on every slide exists in the paper or the data files', async ({ page }) => {
  const { errors, meta } = await open(page);
  const offenders: string[] = [];
  for (const m of meta) {
    await show(page, m.slug);
    const text: string = await page.evaluate(() => {
      const el = document.querySelector('.slide')!.cloneNode(true) as HTMLElement;
      el.querySelectorAll('[data-chrome], [data-derived]').forEach((n) => n.remove());
      return el.textContent ?? '';
    });
    for (const mt of text.matchAll(/\d+(?:[.,]\d+)*/g)) {
      const tok = mt[0].replace(/[.,]+$/, '');
      if (!corpus.has(tok) && !corpus.has(tok.replace(/,/g, ''))) {
        const at = mt.index ?? 0;
        offenders.push(`${m.slug}: "${tok}" in …${text.slice(Math.max(0, at - 40), at + 30).replace(/\s+/g, ' ')}…`);
      }
    }
  }
  expect(offenders, offenders.join('\n')).toEqual([]);
  expect(errors).toEqual([]);
});

test('figure tiles carry their chip and the key figure source link; charts are verified', async ({ page }) => {
  const { errors, meta } = await open(page);
  for (const m of meta) {
    await show(page, m.slug);
    const tiles = await page.$$eval('[data-figure]', (els) =>
      els.map((e) => ({ n: Number(e.getAttribute('data-figure')), chips: e.querySelectorAll('[data-chip]').length, href: e.querySelector('a[data-source]')?.getAttribute('href') })),
    );
    for (const t of tiles) {
      expect(t.chips, `${m.slug} key figure ${t.n} chip`).toBeGreaterThan(0);
      expect(t.href, `${m.slug} key figure ${t.n} source`).toBe(keyFigures[t.n - 1].source_url);
    }
    expect(await page.locator('[data-unverified]').count(), `${m.slug} unverified chart value`).toBe(0);
  }
  expect(errors).toEqual([]);
});

test('proposal, legal and date-of-record notices appear where the brief requires them', async ({ page }) => {
  const { meta } = await open(page);
  for (const m of meta) {
    await show(page, m.slug);
    if (m.paper.some((p) => PROP_SECTIONS.includes(p))) await expect(page.locator('.slide [data-prop-notice]').first(), `${m.slug} PROP notice`).toBeVisible();
    if (m.section === '7') await expect(page.locator('.slide [data-legal-notice]'), `${m.slug} legal notice`).toBeVisible();
    if (m.paper.some((p) => DATED_SECTIONS.includes(p))) await expect(page.locator('.slide [data-date-of-record]').first(), `${m.slug} date of record`).toBeVisible();
  }
});

test('keyboard navigation and deep links', async ({ page }) => {
  const { meta } = await open(page);
  const slug = () => page.locator('.slide').getAttribute('data-slug');
  await page.locator('body').click({ position: { x: 5, y: 300 } });
  expect(await slug()).toBe(meta[0].slug);
  await page.keyboard.press('ArrowRight');
  await expect.poll(slug).toBe(meta[1].slug);
  expect(new URL(page.url()).hash).toBe(`#${meta[1].slug}`);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(slug).toBe(meta[0].slug);
  await page.keyboard.press('End');
  await expect.poll(slug).toBe(meta[meta.length - 1].slug);
  await page.keyboard.press('Home');
  await expect.poll(slug).toBe(meta[0].slug);
  await page.keyboard.press('Shift+ArrowRight');
  const firstOfNext = meta.find((m) => m.section !== meta[0].section)!;
  await expect.poll(slug).toBe(firstOfNext.slug);
  await page.goBack();
  await expect.poll(slug).toBe(meta[0].slug);

  const target = meta[Math.floor(meta.length / 2)];
  await page.goto(`${url}#${target.slug}`);
  await expect.poll(slug).toBe(target.slug);
  for (const m of meta) expect(m.slug).toMatch(/^[a-z0-9-]+$/);
  expect(new Set(meta.map((m) => m.slug)).size).toBe(meta.length);
});

test('no slide scrolls sideways at phone width, in either theme', async ({ browser }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const { errors, meta } = await open(page);
    for (const m of meta) {
      await show(page, m.slug);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `${m.slug} (${colorScheme}) overflows by ${over}px`).toBeLessThanOrEqual(0);
    }
    expect(errors).toEqual([]);
    await ctx.close();
  }
});

test('theme switch and panels', async ({ page }) => {
  await open(page);
  const theme = () => page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  await page.keyboard.press('t');
  expect(await theme()).toBe('dark');
  await page.keyboard.press('t');
  expect(['light', null]).toContain(await theme());
  await page.keyboard.press('s');
  await expect(page.locator('dialog[open] .paper-text')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await page.keyboard.press('o');
  await expect(page.locator('dialog[open] .overview')).toBeVisible();
});
