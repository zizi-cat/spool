import chalk from 'chalk';
import { isAuthenticated } from '../config.js';
import { searchPosts } from '../api.js';

function formatTimestamp(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleString();
}

function truncate(text, maxLength = 120) {
  if (!text) return chalk.dim('(no text)');
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export async function search(query, options) {
  if (!isAuthenticated()) {
    console.log(chalk.red('Not logged in. Run: spool login'));
    process.exit(1);
  }

  const limit = parseInt(options.limit) || 10;
  const isTagSearch = options.tag || query.startsWith('#');

  try {
    const searchQuery = options.tag && !query.startsWith('#') ? `#${query}` : query;
    
    console.log(chalk.cyan(`\n🔍 Searching: ${searchQuery}\n`));
    
    const result = await searchPosts(searchQuery, { 
      limit, 
      tag: isTagSearch 
    });
    
    if (!result.data || result.data.length === 0) {
      console.log(chalk.dim('No results found.'));
      return;
    }
    
    for (const post of result.data) {
      console.log(chalk.cyan.bold(`@${post.username}`));
      console.log(truncate(post.text));
      console.log(chalk.dim(`  ${formatTimestamp(post.timestamp)}`));
      if (post.permalink) {
        console.log(chalk.dim(`  ${post.permalink}`));
      }
      console.log('');
    }
    
    console.log(chalk.dim(`Found ${result.data.length} results`));
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
    
    if (error.code === 190) {
      console.log(chalk.yellow('Your session may have expired. Try: spool login'));
    }
    
    process.exit(1);
  }
}
