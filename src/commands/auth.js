import chalk from 'chalk';
import open from 'open';
import { createServer } from 'http';
import { URL } from 'url';
import {
  setToken,
  setUser,
  clearAuth,
  getClientCredentials,
  setClientCredentials,
  getConfigPath,
} from '../config.js';
import { getMe } from '../api.js';
import * as readline from 'readline';

const REDIRECT_PORT = 8899;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;
const AUTH_URL = 'https://threads.net/oauth/authorize';
const TOKEN_URL = 'https://graph.threads.net/oauth/access_token';
const LONG_LIVED_TOKEN_URL = 'https://graph.threads.net/access_token';

const SCOPES = [
  'threads_basic',
  'threads_content_publish',
  'threads_manage_replies',
  'threads_read_replies',
  'threads_manage_insights',
];

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function login() {
  console.log(chalk.cyan('🧵 Threads Login\n'));
  
  let { clientId, clientSecret } = getClientCredentials();
  
  if (!clientId) {
    console.log(chalk.yellow('No client credentials found.'));
    console.log(chalk.gray('Create a Meta app at: https://developers.facebook.com/apps/\n'));
    
    clientId = await prompt('Client ID: ');
    clientSecret = await prompt('Client Secret: ');
    
    if (!clientId || !clientSecret) {
      console.log(chalk.red('Client credentials required.'));
      process.exit(1);
    }
    
    setClientCredentials(clientId, clientSecret);
    console.log(chalk.green('\n✓ Credentials saved.\n'));
  }

  // Build authorization URL
  const authUrl = new URL(AUTH_URL);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', SCOPES.join(','));
  authUrl.searchParams.set('response_type', 'code');

  console.log(chalk.gray('Opening browser for authorization...\n'));
  console.log(chalk.dim(`If it doesn't open, visit:\n${authUrl.toString()}\n`));

  // Start local server to receive callback
  const code = await new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
      
      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h1>Authorization failed</h1><p>You can close this window.</p>');
          server.close();
          reject(new Error(error));
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>✓ Success!</h1><p>You can close this window and return to the terminal.</p>');
        server.close();
        resolve(code);
      }
    });
    
    server.listen(REDIRECT_PORT, () => {
      open(authUrl.toString());
    });
    
    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authorization timed out'));
    }, 5 * 60 * 1000);
  });

  console.log(chalk.gray('Exchanging code for token...'));

  // Exchange code for short-lived token
  const tokenResponse = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      code: code,
    }),
  });

  const tokenData = await tokenResponse.json();
  
  if (tokenData.error) {
    console.log(chalk.red(`Error: ${tokenData.error_message || tokenData.error}`));
    process.exit(1);
  }

  // Exchange for long-lived token
  console.log(chalk.gray('Getting long-lived token...'));
  
  const longLivedResponse = await fetch(`${LONG_LIVED_TOKEN_URL}?` + new URLSearchParams({
    grant_type: 'th_exchange_token',
    client_secret: clientSecret,
    access_token: tokenData.access_token,
  }));

  const longLivedData = await longLivedResponse.json();
  
  if (longLivedData.error) {
    // Fall back to short-lived token
    console.log(chalk.yellow('Could not get long-lived token, using short-lived.'));
    setToken(tokenData.access_token, tokenData.expires_in);
  } else {
    setToken(longLivedData.access_token, longLivedData.expires_in);
  }

  // Get user info
  console.log(chalk.gray('Fetching profile...'));
  const me = await getMe();
  setUser(me.id, me.username);

  console.log(chalk.green(`\n✓ Logged in as @${me.username}`));
  console.log(chalk.dim(`Config: ${getConfigPath()}`));
}

export async function logout() {
  clearAuth();
  console.log(chalk.green('✓ Logged out. Credentials cleared.'));
}
