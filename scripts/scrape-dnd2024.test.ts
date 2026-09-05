import axios, { type AxiosResponse } from 'axios';
import { JSDOM } from 'jsdom';
import type { Browser } from 'puppeteer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrapeSpellPage } from './scrape-dnd2024';

interface DomPageState {
  closed: boolean;
  evaluations: number;
}

interface DomBrowserOptions {
  failOnExtraction?: boolean;
}

function responseWithHtml(html: string): AxiosResponse<string> {
  return {
    data: html,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  } as AxiosResponse<string>;
}

function createDomBrowser(options: DomBrowserOptions = {}): {
  browser: Browser;
  pages: DomPageState[];
} {
  const pages: DomPageState[] = [];
  const newPage = vi.fn(async () => {
    let dom = new JSDOM('', { runScripts: 'outside-only' });
    const state: DomPageState = { closed: false, evaluations: 0 };

    const page = {
      async evaluate<T>(pageFunction: (...args: never[]) => T, ...args: never[]): Promise<T> {
        state.evaluations++;
        if (options.failOnExtraction && state.evaluations === 2) {
          throw new Error('fixture extraction failed');
        }

        const serializedArgs = args.map((argument) => JSON.stringify(argument)).join(', ');
        const expression = `(${pageFunction.toString()})(${serializedArgs})`;
        return dom.window.eval(expression) as T;
      },
      async setJavaScriptEnabled(): Promise<void> {},
      async setContent(html: string): Promise<void> {
        dom = new JSDOM(html, { runScripts: 'outside-only' });
      },
      async close(): Promise<void> {
        state.closed = true;
      },
    };

    pages.push(state);
    return page;
  });

  return { browser: { newPage } as unknown as Browser, pages };
}

function spellHtml({
  title,
  levelLine,
  components,
  higherLevels,
}: {
  title: string;
  levelLine: string;
  components: string;
  higherLevels: string;
}): string {
  return `<!doctype html>
<html>
  <body>
    <div class="page-title page-header"><span>${title}</span></div>
    <div class="main-content">
      <p>Source: Player's Handbook
${levelLine}
Casting Time: 1 Action
Range: 120 Feet
Components: ${components}
Duration: Instantaneous</p>
      <p>You release a focused magical effect at a creature you can see.</p>
      <p>Using a Higher-Level Spell Slot. ${higherLevels}</p>
    </div>
  </body>
</html>`;
}

// Synthetic parser fixtures: slugs and titles follow real spells so URL
// routing is exercised, but the body text is invented and is NOT official
// spell data.
const levelZeroHtml = spellHtml({
  title: 'Fire Bolt',
  levelLine: 'Level 0 Evocation (Wizard, Sorcerer)',
  components: 'V, S',
  higherLevels: 'The spell deals additional damage at higher levels.',
});

const levelOneHtml = spellHtml({
  title: 'Magic Missile',
  levelLine: 'Level 1 Evocation (Wizard, Sorcerer)',
  components: 'V, S, M (a tiny ball of bat guano and sulfur)',
  higherLevels: 'The spell creates one more dart for each slot level above 1.',
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('scrapeSpellPage', () => {
  it('extracts level-zero and level-one fields from synthetic wikidot-style fixtures through the production parser', async () => {
    const axiosGet = vi.spyOn(axios, 'get').mockImplementation(async (url) => {
      return responseWithHtml(url.includes('fire-bolt') ? levelZeroHtml : levelOneHtml);
    });
    const { browser, pages } = createDomBrowser();

    const cantrip = await scrapeSpellPage(browser, 'fire-bolt');
    const firstLevel = await scrapeSpellPage(browser, 'magic-missile');

    expect(axiosGet).toHaveBeenNthCalledWith(
      1,
      'http://dnd2024.wikidot.com/spell:fire-bolt',
      { timeout: 10000 },
    );
    expect(axiosGet).toHaveBeenNthCalledWith(
      2,
      'http://dnd2024.wikidot.com/spell:magic-missile',
      { timeout: 10000 },
    );

    expect(cantrip).toMatchObject({
      name: 'Fire Bolt',
      level: 0,
      school: 'evocation',
      castingTime: '1 Action',
      range: '120 Feet',
      components: { verbal: true, somatic: true, material: false },
      duration: 'Instantaneous',
      classes: ['wizard', 'sorcerer'],
      atHigherLevels: 'The spell deals additional damage at higher levels.',
    });
    // scrapeSpellPage may return null; optional chaining keeps this an
    // assertion that still fails when the parser returns nothing.
    expect(cantrip?.description).toContain(
      'You release a focused magical effect at a creature you can see.',
    );

    expect(firstLevel).toMatchObject({
      name: 'Magic Missile',
      level: 1,
      school: 'evocation',
      components: { verbal: true, somatic: true, material: true },
      classes: ['wizard', 'sorcerer'],
      atHigherLevels: 'The spell creates one more dart for each slot level above 1.',
    });
    expect(firstLevel?.description).toContain(
      'The spell creates one more dart for each slot level above 1.',
    );
    expect(pages).toHaveLength(2);
    expect(pages.every((page) => page.closed)).toBe(true);
  });

  it('closes the page when production extraction fails', async () => {
    const axiosGet = vi.spyOn(axios, 'get').mockResolvedValue(responseWithHtml(levelOneHtml));
    const { browser, pages } = createDomBrowser({ failOnExtraction: true });

    await expect(scrapeSpellPage(browser, 'broken-spell')).rejects.toThrow(
      'fixture extraction failed',
    );

    expect(axiosGet).toHaveBeenCalledWith(
      'http://dnd2024.wikidot.com/spell:broken-spell',
      { timeout: 10000 },
    );
    expect(pages).toHaveLength(1);
    expect(pages[0]?.closed).toBe(true);
  });
});