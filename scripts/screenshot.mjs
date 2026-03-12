#!/usr/bin/env node
/**
 * Renders index.html in headless Chrome, saves a screenshot, and ensures
 * README.md includes it. Run from repo root.
 */
import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const indexPath = join(root, 'index.html');
const screenshotPath = join(root, 'screenshot.png');
const readmePath = join(root, 'README.md');

const VIEWPORT = { width: 1200, height: 800 };

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

try {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  await page.goto(`file://${indexPath}`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: screenshotPath });
} finally {
  await browser.close();
}

const readme = readFileSync(readmePath, 'utf8');
const screenshotLine = '\n\n![Screenshot](screenshot.png)\n';
const hasScreenshot = readme.includes('![Screenshot](screenshot.png)');

if (!hasScreenshot) {
  const newReadme = readme.trimEnd() + screenshotLine;
  writeFileSync(readmePath, newReadme);
}
