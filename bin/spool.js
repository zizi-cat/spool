#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { login, logout } from '../src/commands/auth.js';
import { whoami } from '../src/commands/whoami.js';
import { post } from '../src/commands/post.js';
import { reply } from '../src/commands/reply.js';
import { read } from '../src/commands/read.js';
import { search } from '../src/commands/search.js';
import { posts } from '../src/commands/posts.js';

program
  .name('spool')
  .description('🧵 Threads CLI - Post, read, and search on Meta\'s Threads')
  .version('0.1.0');

// Auth commands
program
  .command('login')
  .description('Authenticate with Threads')
  .action(login);

program
  .command('logout')
  .description('Remove stored credentials')
  .action(logout);

// User commands
program
  .command('whoami')
  .alias('me')
  .description('Show your Threads profile')
  .action(whoami);

// Post commands
program
  .command('post <text>')
  .alias('tweet')
  .description('Create a new thread')
  .option('-i, --image <url>', 'Attach an image URL')
  .option('-v, --video <url>', 'Attach a video URL')
  .action(post);

program
  .command('reply <id> <text>')
  .description('Reply to a thread')
  .action(reply);

program
  .command('read <id>')
  .description('Read a thread by ID or URL')
  .action(read);

program
  .command('posts')
  .alias('feed')
  .description('List your recent posts')
  .option('-n, --limit <number>', 'Number of posts', '10')
  .action(posts);

// Search
program
  .command('search <query>')
  .description('Search threads')
  .option('-n, --limit <number>', 'Number of results', '10')
  .option('-t, --tag', 'Search by topic tag')
  .action(search);

// Parse and run
program.parse();
