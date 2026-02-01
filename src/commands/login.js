import chalk from 'chalk';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import puppeteer from 'puppeteer-core';

const CONFIG_DIR = join(homedir(), '.config/spool-cli');
const COOKIES_PATH = join(CONFIG_DIR, 'cookies.json');

export async function login(options) {
  // Ensure config dir exists
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (options.path) {
    console.log(chalk.cyan('Cookie file location:'));
    console.log(COOKIES_PATH);
    return;
  }

  if (options.export) {
    await exportFromBrowser();
    return;
  }

  // Show current status
  if (existsSync(COOKIES_PATH)) {
    const cookies = JSON.parse(readFileSync(COOKIES_PATH, 'utf-8'));
    const sessionId = cookies.find(c => c.name === 'sessionid');
    if (sessionId) {
      console.log(chalk.green('✓ Cookies configured'));
      console.log(chalk.gray(`  ${cookies.length} cookies stored`));
      console.log(chalk.gray(`  Path: ${COOKIES_PATH}`));
      return;
    }
  }

  console.log(chalk.yellow('No cookies configured.'));
  console.log();
  console.log('To setup, run one of:');
  console.log(chalk.cyan('  spool login --export') + '  # Export from running browser');
  console.log(chalk.cyan('  spool login --path') + '    # Show cookie file path');
}

async function exportFromBrowser() {
  const CDP_URL = process.env.SPOOL_CDP_URL || 'http://localhost:9222';
  
  console.log(chalk.gray(`Connecting to browser at ${CDP_URL}...`));
  
  try {
    const browser = await puppeteer.connect({ browserURL: CDP_URL });
    const pages = await browser.pages();
    const page = pages[0];
    
    // Navigate to threads.com to get cookies
    console.log(chalk.gray('Fetching cookies from threads.com...'));
    await page.goto('https://www.threads.com/', { waitUntil: 'networkidle2', timeout: 30000 });
    
    const cookies = await page.cookies();
    const relevantCookies = cookies.filter(c => 
      c.domain.includes('threads') || c.domain.includes('instagram')
    );
    
    if (relevantCookies.length === 0) {
      console.log(chalk.red('No Threads cookies found. Make sure you are logged in.'));
      await browser.disconnect();
      process.exit(1);
    }
    
    // Check for session
    const hasSession = relevantCookies.some(c => c.name === 'sessionid');
    if (!hasSession) {
      console.log(chalk.red('Not logged in. Please login to threads.com first.'));
      await browser.disconnect();
      process.exit(1);
    }
    
    // Save cookies
    writeFileSync(COOKIES_PATH, JSON.stringify(relevantCookies, null, 2));
    
    console.log(chalk.green(`✓ Exported ${relevantCookies.length} cookies`));
    console.log(chalk.gray(`  Saved to: ${COOKIES_PATH}`));
    
    await browser.disconnect();
  } catch (e) {
    if (e.message.includes('Failed to fetch')) {
      console.log(chalk.red('Could not connect to browser.'));
      console.log();
      console.log('Start Chromium with remote debugging:');
      console.log(chalk.cyan('  chromium --remote-debugging-port=9222'));
      console.log();
      console.log('Then login to threads.com and run this command again.');
    } else {
      console.log(chalk.red(`Error: ${e.message}`));
    }
    process.exit(1);
  }
}
