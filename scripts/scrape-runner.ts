import fs from 'node:fs';
import type { Browser } from 'puppeteer';

/**
 * Raised when a batch run stops early in stop-on-error mode.
 *
 * Thrown (instead of exiting the process) so callers can release shared
 * resources such as the browser before setting a nonzero exit code.
 */
export class BatchScrapeStopError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BatchScrapeStopError';
  }
}

/** Minimal shape every scraped record must satisfy. */
export interface ScrapeRecord {
  name?: string;
}

/** CLI options shared by every batch scrape run. */
export interface CliScrapeOptions {
  /** Specific item names to scrape (comma-separated); empty string means scrape the full index. */
  items: string;
  /** Limit scrape to first N items (for testing); null means no limit. */
  maxItems: number | null;
  /** Delay between requests in milliseconds. */
  delay: number;
  /** Max retry attempts per item. */
  retries: number;
  /** Continue scraping after errors instead of stopping. */
  continueOnError: boolean;
}

/** Per-type configuration describing one batch scrape run. */
export interface BatchScrapeConfig<T extends ScrapeRecord> {
  /** Plural noun used in log messages, e.g. "spells". */
  pluralLabel: string;
  /** Noun for the per-page loop message, e.g. "spell pages". */
  pageLabel: string;
  /** Final output file path, e.g. "src/data/spells.json". */
  outputFilename: string;
  /** Fetch the full list of item names from the index pages. */
  getIndex: (browser: Browser) => Promise<string[]>;
  /** Extract data for a single item page. */
  scrapePage: (browser: Browser, itemName: string) => Promise<T | null>;
  /** CLI options for this run. */
  cli: CliScrapeOptions;
}

/**
 * Retry a single-item scrape with exponential backoff.
 * Throws the last error after `maxRetries` failed attempts.
 */
export async function scrapeWithRetry<T extends ScrapeRecord>(
  browser: Browser,
  itemName: string,
  scraperFn: (browser: Browser, name: string) => Promise<T | null>,
  maxRetries: number = 3
): Promise<T | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await scraperFn(browser, itemName);

      if (result && result.name) {
        return result;
      }

      throw new Error('Invalid data structure');

    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`\n❌ ${itemName} - Attempt ${attempt}/${maxRetries} FAILED`);
      console.error(`   Raw error: ${lastError.message}`);
      console.error(`   Stack: ${lastError.stack || 'N/A'}`);

      if (attempt < maxRetries) {
        const delay = 500 * Math.pow(2, attempt - 1);
        console.log(`  ⏳ Retry ${attempt + 1}/${maxRetries} for ${itemName} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Unknown error during scraping');
}

/** Save the items collected so far to a `.partial` file so progress is not lost. */
function savePartialOutput(data: unknown[], timestamp: string, type: string): void {
  const outputPath = `src/data/${type}-${timestamp}.json.partial`;

  try {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Partial output saved to ${outputPath}`);
  } catch (error: unknown) {
    console.error(`❌ Failed to save partial output: ${(error as Error).message}`);
  }
}

/** Print the success/warning/error summary block. */
export function printSummary(
  successCount: number,
  warningCount: number,
  errorCount: number,
  totalItems: number
): void {
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 SCRAPING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✓ Successful: ${successCount}`);
  console.log(`⚠️  Warnings (partial data): ${warningCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total items collected: ${totalItems}`);
}

/**
 * Persist progress and abort the batch run (unless continue-on-error is set).
 * Throws so the caller can close shared resources before exiting.
 */
function stopOnFailure<T extends ScrapeRecord>(
  config: BatchScrapeConfig<T>,
  collected: T[],
  successCount: number,
  warningCount: number,
  errorCount: number,
  totalItems: number
): never {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  savePartialOutput(collected, timestamp, config.pluralLabel);
  printSummary(successCount, warningCount, errorCount, totalItems);
  console.log('\n⛔ Stopping due to error.');
  throw new BatchScrapeStopError(`Stopped scraping ${config.pluralLabel} due to error`);
}

/**
 * Shared batch runner for item page scrapes.
 *
 * Resolves the item list (targeted names or index), then scrapes each page
 * with retry/delay handling, saving partial output on failure unless
 * continue-on-error is set, and finally writes the complete output file.
 *
 * Rejects on fatal failures (empty index, stop-on-error abort, write errors)
 * instead of exiting, so callers can clean up shared resources first.
 */
export async function runBatchScrape<T extends ScrapeRecord>(
  browser: Browser,
  config: BatchScrapeConfig<T>
): Promise<void> {
  const { cli } = config;
  let itemNames: string[] = [];

  if (cli.items && cli.items.trim()) {
    itemNames = cli.items.split(',').map(s => s.trim()).filter(s => s);
    console.log(`⚙️  Targeted scrape mode: ${itemNames.length} specific ${config.pluralLabel}`);
  } else {
    const allNames = await config.getIndex(browser);

    if (allNames.length === 0) {
      throw new Error(`No ${config.pluralLabel} found in index`);
    }

    itemNames = allNames;

    if (cli.maxItems) {
      console.log(`⚙️  Test mode: Limiting to first ${cli.maxItems} ${config.pluralLabel}`);
      itemNames = itemNames.slice(0, cli.maxItems);
    }
  }

  if (cli.continueOnError) {
    console.log(`⚙️  Continue on error mode enabled`);
  }
  console.log(`⚙️  Delay between requests: ${cli.delay}ms\n`);

  const allItems: T[] = [];
  let successCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  try {
    console.log(`📜 Scraping ${itemNames.length} individual ${config.pageLabel}...\n`);

    for (const [index, itemName] of itemNames.entries()) {
      if (cli.maxItems && index >= cli.maxItems) break;

      const progress = Math.round((index + 1) / itemNames.length * 100);
      process.stdout.write(`\r[${'='.repeat(Math.floor(progress / 2))}${' '.repeat(50 - Math.floor(progress / 2))}] ${index + 1}/${itemNames.length} (${progress}%) - ${itemName}`);

      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, cli.delay));
      }

      try {
        const data = await scrapeWithRetry(browser, itemName, config.scrapePage, cli.retries);

        if (!data || !data.name) {
          console.warn(`\n⚠️  ${itemName}: Failed to extract data`);

          warningCount++;

          if (!cli.continueOnError) {
            stopOnFailure(config, allItems, successCount, warningCount, errorCount, itemNames.length);
          }

          continue;
        }

        allItems.push(data);
        successCount++;

      } catch (error: unknown) {
        console.warn(`\n❌ ${itemName}: ${(error as Error).message}`);

        errorCount++;

        if (!cli.continueOnError) {
          stopOnFailure(config, allItems, successCount, warningCount, errorCount, itemNames.length);
        }
      }
    }

    fs.writeFileSync(config.outputFilename, JSON.stringify(allItems, null, 2));
    console.log(`\n\n✓ Final output saved to ${config.outputFilename}`);

    printSummary(successCount, warningCount, errorCount, itemNames.length);

  } catch (error: unknown) {
    if (!(error instanceof BatchScrapeStopError)) {
      console.error(`\n❌ Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    }
    // Propagate instead of exiting so the caller's cleanup (e.g. browser
    // close) runs before a nonzero exit code is set.
    throw error;
  }
}