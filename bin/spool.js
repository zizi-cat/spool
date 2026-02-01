#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { login } from '../src/commands/login.js';
import { whoami } from '../src/commands/whoami.js';
import { post } from '../src/commands/post.js';

program
  .name('spool')
  .description('🧵 Threads CLI - Post to Meta\'s Threads from the terminal')
  .version('0.2.0');

// Login/setup
program
  .command('login')
  .description('Setup or check authentication')
  .option('--export', 'Export cookies from running browser (CDP)')
  .option('--path', 'Show cookie file path')
  .action(login);

// User info
program
  .command('whoami')
  .description('Show current logged in user')
  .action(whoami);

// Post
program
  .command('post <text>')
  .description('Post a new thread')
  .option('--confirm', 'Ask for confirmation before posting')
  .action(post);

// Default action - show help
program
  .action(() => {
    program.help();
  });

program.parse();
