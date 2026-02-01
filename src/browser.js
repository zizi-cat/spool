import puppeteer from 'puppeteer-core';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const COOKIES_PATH = join(homedir(), '.config/spool-cli/cookies.json');
const CHROMIUM_PATH = '/usr/bin/chromium';

let browser = null;
let page = null;

export async function connect() {
  if (browser && page) return page;
  
  // Launch headless browser
  browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  
  page = await browser.newPage();
  
  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
  
  // Load cookies if exist
  if (existsSync(COOKIES_PATH)) {
    const cookies = JSON.parse(readFileSync(COOKIES_PATH, 'utf-8'));
    await page.setCookie(...cookies);
  }
  
  return page;
}

export async function disconnect() {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
  }
}

export async function saveCookies() {
  if (!page) return;
  const cookies = await page.cookies('https://www.threads.com');
  writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
}

export async function isLoggedIn() {
  const p = await connect();
  await p.goto('https://www.threads.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  
  const loggedIn = await p.evaluate(() => {
    return document.body.innerText.includes("What's new?") || 
           document.querySelector('[aria-label="Profile"]') !== null;
  });
  
  return loggedIn;
}

export async function getProfile() {
  const p = await connect();
  const cookies = await p.cookies();
  const userId = cookies.find(c => c.name === 'ds_user_id')?.value;
  
  if (!userId) return null;
  
  // Go to profile page to get username
  await p.goto(`https://www.threads.com/`, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Click profile icon and extract username from URL
  const username = await p.evaluate(() => {
    const profileLink = document.querySelector('a[href*="/@"]');
    if (profileLink) {
      const match = profileLink.href.match(/@([^/]+)/);
      return match ? match[1] : null;
    }
    return null;
  });
  
  return { id: userId, username: username || 'unknown' };
}

export async function post(text) {
  const p = await connect();
  
  await p.goto('https://www.threads.com/', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Click "What's new?"
  await p.evaluate(() => {
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      if (el.textContent?.trim() === "What's new?" && el.offsetParent !== null) {
        el.click();
        return;
      }
    }
  });
  
  await new Promise(r => setTimeout(r, 1500));
  
  // Type post content
  await p.keyboard.type(text, { delay: 20 });
  await new Promise(r => setTimeout(r, 500));
  
  // Click Post button
  const posted = await p.evaluate(() => {
    const buttons = document.querySelectorAll('div[role="button"], button');
    for (const btn of buttons) {
      const text = btn.textContent?.trim();
      if (text === 'Post' && btn.offsetParent !== null) {
        btn.click();
        return true;
      }
    }
    return false;
  });
  
  if (!posted) throw new Error('Could not find Post button');
  
  await new Promise(r => setTimeout(r, 3000));
  await saveCookies(); // Update cookies after posting
  
  return { success: true };
}

export async function screenshot(path) {
  const p = await connect();
  await p.screenshot({ path });
}
