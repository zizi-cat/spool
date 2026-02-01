import chalk from 'chalk';
import { isAuthenticated, getUser } from '../config.js';
import { getUserPosts } from '../api.js';

function formatTimestamp(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleString();
}

function truncate(text, maxLength = 100) {
  if (!text) return chalk.dim('(no text)');
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export async function posts(options) {
  if (!isAuthenticated()) {
    console.log(chalk.red('Not logged in. Run: spool login'));
    process.exit(1);
  }

  const limit = parseInt(options.limit) || 10;
  const user = getUser();

  try {
    console.log(chalk.cyan(`\n🧵 Your Recent Threads (@${user.username || 'me'})\n`));
    
    const result = await getUserPosts(limit);
    
    if (!result.data || result.data.length === 0) {
      console.log(chalk.dim('No posts yet.'));
      return;
    }
    
    for (const post of result.data) {
      const isReply = post.is_reply ? chalk.dim(' [reply]') : '';
      const mediaType = post.media_type !== 'TEXT' ? chalk.yellow(` [${post.media_type}]`) : '';
      
      console.log(chalk.bold(truncate(post.text)));
      console.log(chalk.dim(`  ${formatTimestamp(post.timestamp)}${isReply}${mediaType}`));
      console.log(chalk.dim(`  ${post.permalink || `ID: ${post.id}`}`));
      console.log('');
    }
    
    if (result.paging && result.paging.next) {
      console.log(chalk.dim('Use --limit to see more posts'));
    }
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
