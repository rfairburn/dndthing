/**
 * Real-browser smoke test for the Vite application (development + production preview).
 *
 * Prerequisite: run `npm run build` first so that `dist/` exists for preview mode.
 * Run with: npx tsx scripts/browser-smoke.ts
 *
 * Deterministic and offline: binds loopback-only ephemeral ports, blocks every
 * non-loopback page request, loads the real app in Chromium, and asserts that the
 * Character Generator renders and navigation to the Reference Library works on
 * desktop and 375px mobile without horizontal overflow. Any pageerror,
 * console.error, missing element, or overflow fails the run with a nonzero exit.
 * Chromium launches sandboxed by default; set PUPPETEER_NO_SANDBOX=1 only on
 * constrained hosts where the sandbox cannot start. Test seams: setting
 * BROWSER_SMOKE_STARTUP_DELAY_MS (ms) together with
 * BROWSER_SMOKE_STARTUP_DELAY_MODES (comma list of launch,development,preview)
 * delays those acquisitions so the late-resolution cleanup path can be
 * exercised end to end.
 */

import { dirname, resolve } from 'node:path';
import type { AddressInfo } from 'node:net';
import type { Server as NodeHttpServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import puppeteer, { type Browser } from 'puppeteer';
import { createServer, preview, type PreviewServer, type ViteDevServer } from 'vite';

const LOOPBACK_HOST = '127.0.0.1';
const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SERVER_TIMEOUT_MS = 15_000;
const BROWSER_TIMEOUT_MS = 15_000;
const PAGE_TIMEOUT_MS = 10_000;
const CLEANUP_TIMEOUT_MS = 5_000;
const STARTUP_DELAY_MS = Number(process.env.BROWSER_SMOKE_STARTUP_DELAY_MS ?? '0');
const DELAY_MODES = new Set((process.env.BROWSER_SMOKE_STARTUP_DELAY_MODES ?? '').split(',').filter(Boolean));
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
] as const;

type AppServer = ViteDevServer | PreviewServer;
type SmokeMode = 'development' | 'preview';
/** A resource we own. `close` is graceful; `force` is the fallback when it fails. */
type TrackedResource = { label: string; closed: boolean; close: () => Promise<void>; force?: () => void };

function describeError(value: unknown): string {
  return value instanceof Error ? (value.stack ?? value.message) : String(value);
}

/**
 * Race an acquisition against a deadline while retaining ownership of the pending
 * promise. In-time resources are registered for final cleanup; if the acquisition
 * settles after the deadline (possibly after final cleanup has already run),
 * onLate closes it immediately so nothing is left behind. A late rejection leaves
 * nothing to clean up.
 */
async function acquireWithTimeout<T>(
  label: string,
  timeoutMs: number,
  acquire: () => Promise<T>,
  register: (value: T) => void,
  onLate: (value: T) => void,
): Promise<T> {
  const operation = acquire();
  let settledInTime = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    const value = await Promise.race([operation, deadline]);
    settledInTime = true;
    register(value);
    return value;
  } finally {
    clearTimeout(timer);
    void operation.then(
      (value) => { if (!settledInTime) onLate(value); },
      () => undefined,
    );
  }
}

async function closeTracked(resource: TrackedResource, failures: string[]): Promise<void> {
  if (resource.closed) return;
  resource.closed = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${resource.label} cleanup timed out after ${CLEANUP_TIMEOUT_MS}ms`)), CLEANUP_TIMEOUT_MS);
  });
  try {
    await Promise.race([resource.close(), deadline]);
  } catch (error) {
    try { resource.force?.(); } catch { /* best effort */ }
    failures.push(`${resource.label} cleanup: ${describeError(error)}`);
  } finally {
    clearTimeout(timer);
  }
}

function forceCloseBrowser(browser: Browser): void {
  try { browser.disconnect(); } catch { /* best effort */ }
  const child = browser.process();
  if (child && !child.killed) {
    try { child.kill('SIGKILL'); } catch { /* best effort */ }
  }
}

function forceCloseServer(server: AppServer): void {
  const httpServer = server.httpServer as NodeHttpServer | null;
  if (!httpServer) return;
  try { httpServer.closeAllConnections(); } catch { /* best effort */ }
  try { httpServer.close(); } catch { /* best effort */ }
}

async function startDevelopmentServer(): Promise<ViteDevServer> {
  const server = await createServer({
    root: REPOSITORY_ROOT,
    logLevel: 'error',
    server: { host: LOOPBACK_HOST, port: 0, strictPort: true, hmr: false },
  });
  try {
    await server.listen();
    return server;
  } catch (error) {
    try { await server.close(); } catch { forceCloseServer(server); }
    throw error;
  }
}

async function runPageSmoke(browser: Browser, resources: TrackedResource[], mode: SmokeMode, origin: string, viewport: (typeof VIEWPORTS)[number]): Promise<void> {
  let pageResource: TrackedResource | undefined;
  const failures: string[] = [];
  const page = await acquireWithTimeout(
    `${mode} ${viewport.name} page creation`,
    BROWSER_TIMEOUT_MS,
    () => browser.newPage(),
    (newPage) => {
      pageResource = { label: `${mode} ${viewport.name} page`, closed: false, close: () => newPage.close() };
      resources.push(pageResource);
    },
    (newPage) => void closeTracked({ label: `${mode} ${viewport.name} page (late)`, closed: false, close: () => newPage.close() }, failures),
  );

  const originUrl = new URL(origin);
  page.on('pageerror', (error) => failures.push(`pageerror: ${describeError(error)}`));
  page.on('console', (message) => { if (message.type() === 'error') failures.push(`console.error: ${message.text()}`); });
  page.on('request', (request) => {
    let url: URL;
    try { url = new URL(request.url()); } catch { void request.abort().catch(() => undefined); return; }
    const loopback = !['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol) ||
      (url.hostname === LOOPBACK_HOST && url.port === originUrl.port);
    if (loopback) void request.continue().catch(() => undefined);
    else { failures.push(`external request blocked: ${request.url()}`); void request.abort().catch(() => undefined); }
  });

  const measureLayout = () => page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));

  try {
    page.setDefaultTimeout(PAGE_TIMEOUT_MS);
    page.setDefaultNavigationTimeout(PAGE_TIMEOUT_MS);
    await page.setRequestInterception(true);
    await page.setViewport({ width: viewport.width, height: viewport.height });

    const response = await page.goto(origin, { waitUntil: 'load' });
    if (!response || response.status() >= 400) throw new Error(`app load returned ${response?.status() ?? 'no response'}`);

    await page.waitForSelector('h2', { visible: true });
    const headingText = (await page.$eval('h2', (element) => element.textContent ?? '')).trim();
    if (headingText !== 'Character Name') throw new Error(`rendered unexpected generator heading: ${headingText}`);
    const generatorLayout = await measureLayout();
    await page.locator('text=Reference Library').click();
    await page.waitForSelector('input[placeholder="Search spells..."]', { visible: true });
    const referenceLayout = await measureLayout();

    for (const [view, layout] of [['Character Generator', generatorLayout], ['Reference Library', referenceLayout]] as const) {
      if (layout.scrollWidth > layout.viewportWidth) throw new Error(`${view} has horizontal overflow at ${layout.viewportWidth}px (scroll width ${layout.scrollWidth}px)`);
    }
  } catch (error) {
    failures.push(describeError(error));
  } finally {
    if (pageResource) await closeTracked(pageResource, failures);
  }

  if (failures.length > 0) throw new Error(`${mode} ${viewport.name}: ${failures.join('; ')}`);
}

async function run(): Promise<void> {
  const failures: string[] = [];
  const resources: TrackedResource[] = [];
  const delay = (mode: string) => DELAY_MODES.has(mode)
    ? new Promise<void>((resolveDelay) => setTimeout(resolveDelay, STARTUP_DELAY_MS))
    : Promise.resolve();

  try {
    const launchOptions = process.env.PUPPETEER_NO_SANDBOX === '1'
      ? { headless: true as const, timeout: BROWSER_TIMEOUT_MS, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
      : { headless: true as const, timeout: BROWSER_TIMEOUT_MS };

    const browser = await acquireWithTimeout('Chromium launch', BROWSER_TIMEOUT_MS, async () => {
      await delay('launch');
      return puppeteer.launch(launchOptions);
    }, (launched) => resources.push({ label: 'Chromium', closed: false, close: () => launched.close(), force: () => forceCloseBrowser(launched) }),
      (launched) => void closeTracked({ label: 'Chromium (late)', closed: false, close: () => launched.close(), force: () => forceCloseBrowser(launched) }, failures));

    for (const mode of ['development', 'preview'] as const) {
      try {
        const server = await acquireWithTimeout(`Vite ${mode} server startup`, SERVER_TIMEOUT_MS, async () => {
          await delay(mode);
          return mode === 'development' ? startDevelopmentServer() : preview({
            root: REPOSITORY_ROOT,
            logLevel: 'error',
            preview: { host: LOOPBACK_HOST, port: 0, strictPort: true },
          });
        }, (started) => resources.push({ label: `${mode} server`, closed: false, close: () => started.close(), force: () => forceCloseServer(started) }),
          (started) => void closeTracked({ label: `${mode} server (late)`, closed: false, close: () => started.close(), force: () => forceCloseServer(started) }, failures));

        const address = server.httpServer?.address();
        if (!address || typeof address === 'string' || !address.port) throw new Error('Vite server did not bind an ephemeral loopback port');
        const origin = `http://${LOOPBACK_HOST}:${(address as AddressInfo).port}`;

        for (const viewport of VIEWPORTS) {
          try {
            await runPageSmoke(browser, resources, mode, origin, viewport);
            console.log(`[browser-smoke] ${mode} ${viewport.name}: passed`);
          } catch (error) {
            failures.push(`${mode} ${viewport.name}: ${describeError(error)}`);
          }
        }
      } catch (error) {
        failures.push(`${mode} server: ${describeError(error)}`);
      }
    }
  } catch (error) {
    failures.push(`browser smoke setup: ${describeError(error)}`);
  } finally {
    for (const resource of [...resources].reverse()) await closeTracked(resource, failures);
  }

  if (failures.length > 0) throw new Error(failures.join('\n'));
  console.log('[browser-smoke] development and production preview passed on desktop and 375px mobile');
}

run().catch((error: unknown) => {
  console.error(`[browser-smoke] FAILED\n${describeError(error)}`);
  process.exitCode = 1;
});
