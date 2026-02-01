import chalk from 'chalk';
import { isAuthenticated } from '../config.js';
import { getPost, getReplies } from '../api.js';

function extractPostId(input) {
  // Handle URLs
  const urlMatch = input.match(/threads\.net\/@[^\/]+\/post\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  return input;
}

function formatTimestamp(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  return date.toLocaleString();
}

export async function read(id) {
  if (!isAuthenticated()) {
    console.log(chalk.red('Not logged in. Run: spool login'));
    process.exit(1);
  }

  const postId = extractPostId(id);

  try {
    const post = await getPost(postId);
    
    console.log('');
    console.log(chalk.cyan.bold(`@${post.username}`));
    console.log(post.text || chalk.dim('(no text)'));
    
    if (post.media_url) {
      console.log(chalk.dim(`\n📎 ${post.media_type}: ${post.media_url}`));
    }
    
    console.log(chalk.dim(`\n${formatTimestamp(post.timestamp)}`));
    
    if (post.permalink) {
      console.log(chalk.dim(post.permalink));
    }
    
    // Fetch replies if any
    if (post.has_replies) {
      console.log(chalk.yellow('\n--- Replies ---'));
      
      try {
        const replies = await getReplies(postId, 5);
        
        if (replies.data && replies.data.length > 0) {
          for (const reply of replies.data) {
            console.log('');
            console.log(chalk.cyan(`  @${reply.username}`));
            console.log(`  ${reply.text || chalk.dim('(no text)')}`);
            console.log(chalk.dim(`  ${formatTimestamp(reply.timestamp)}`));
          }
        }
      } catch (e) {
        // Might not have permission to read replies
        console.log(chalk.dim('  (Could not load replies)'));
      }
    }
    
    console.log('');
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
