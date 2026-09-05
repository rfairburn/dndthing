import fs from 'node:fs';
import type { Browser } from 'puppeteer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  BatchScrapeStopError,
  runBatchScrape,
  type CliScrapeOptions,
  type ScrapeRecord,
} from './scrape-runner';

interface CapturedWrite {
  path: string;
  content: string;
}

function captureWrites(): CapturedWrite[] {
  const writes: CapturedWrite[] = [];

  vi.spyOn(fs, 'writeFileSync').mockImplementation((file, data) => {
    writes.push({ path: String(file), content: String(data) });
  });

  return writes;
}

function cliOptions(overrides: Partial<CliScrapeOptions> = {}): CliScrapeOptions {
  return {
    items: '',
    maxItems: null,
    delay: 0,
    retries: 1,
    continueOnError: false,
    ...overrides,
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('runBatchScrape', () => {
  it('writes successful results and limits index scrapes to max-items', async () => {
    const writes = captureWrites();
    const scrapedNames: string[] = [];

    await runBatchScrape({} as Browser, {
      pluralLabel: 'test items',
      pageLabel: 'test pages',
      outputFilename: 'runner-success-output.json',
      getIndex: async () => ['alpha', 'beta', 'gamma'],
      scrapePage: async (_browser, itemName) => {
        scrapedNames.push(itemName);
        return { name: itemName };
      },
      cli: cliOptions({ maxItems: 2 }),
    });

    expect(scrapedNames).toEqual(['alpha', 'beta']);
    expect(writes).toEqual([
      {
        path: 'runner-success-output.json',
        content: JSON.stringify([{ name: 'alpha' }, { name: 'beta' }], null, 2),
      },
    ]);
  });

  it('persists collected results and throws when stop-on-error encounters a failure', async () => {
    const writes = captureWrites();

    await expect(
      runBatchScrape({} as Browser, {
        pluralLabel: 'stop-items',
        pageLabel: 'stop pages',
        outputFilename: 'runner-stop-output.json',
        getIndex: async () => ['first', 'broken', 'never-reached'],
        scrapePage: async (_browser, itemName) => {
          if (itemName === 'broken') {
            throw new Error('fixture page failed');
          }

          return { name: itemName };
        },
        cli: cliOptions(),
      }),
    ).rejects.toBeInstanceOf(BatchScrapeStopError);

    expect(writes).toHaveLength(1);
    expect(writes[0]?.path).toMatch(/^src\/data\/stop-items-.+\.json\.partial$/);
    expect(writes[0]?.content).toBe(JSON.stringify([{ name: 'first' }], null, 2));
  });

  it('continues after an item error and writes only successful results', async () => {
    const writes = captureWrites();
    const scrapedNames: string[] = [];

    await runBatchScrape({} as Browser, {
      pluralLabel: 'continue-items',
      pageLabel: 'continue pages',
      outputFilename: 'runner-continue-output.json',
      getIndex: async () => ['first', 'broken', 'last'],
      scrapePage: async (_browser, itemName) => {
        scrapedNames.push(itemName);
        if (itemName === 'broken') {
          throw new Error('fixture page failed');
        }

        return { name: itemName };
      },
      cli: cliOptions({ continueOnError: true }),
    });

    expect(scrapedNames).toEqual(['first', 'broken', 'last']);
    expect(writes).toEqual([
      {
        path: 'runner-continue-output.json',
        content: JSON.stringify([{ name: 'first' }, { name: 'last' }], null, 2),
      },
    ]);
  });

  it('retries a failed item before writing its eventual success', async () => {
    vi.useFakeTimers();
    const writes = captureWrites();
    let attempts = 0;

    const run = runBatchScrape({} as Browser, {
      pluralLabel: 'retry-items',
      pageLabel: 'retry pages',
      outputFilename: 'runner-retry-output.json',
      getIndex: async () => [],
      scrapePage: async (_browser, itemName): Promise<ScrapeRecord> => {
        attempts++;
        if (attempts === 1) {
          throw new Error('transient fixture failure');
        }

        return { name: itemName };
      },
      cli: cliOptions({ items: 'eventual', retries: 2 }),
    });

    await vi.runAllTimersAsync();
    await expect(run).resolves.toBeUndefined();

    expect(attempts).toBe(2);
    expect(writes).toEqual([
      {
        path: 'runner-retry-output.json',
        content: JSON.stringify([{ name: 'eventual' }], null, 2),
      },
    ]);
  });
});