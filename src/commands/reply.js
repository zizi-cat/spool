import chalk from 'chalk';
import { isAuthenticated } from '../config.js';
import { createTextPost, getPost } from '../api.js';

function extractPostId(input) {
  // Handle URLs like https://www.threads.net/@username/post/ABC123
  const urlMatch = input.match(/threads\.net\/@[^\/]+\/post\/([a-zA-Z0-9_-]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  // Assume it's already an ID
  return input;
}

export async function reply(id, text) {
  if (!isAuthenticated()) {
    console.log(chalk.red('Not logged in. Run: spool login'));
    process.exit(1);
  }

  const postId = extractPostId(id);

  if (!text || text.trim().length === 0) {
    console.log(chalk.red('Reply text is required.'));
    process.exit(1);
  }

  if (text.length > 500) {
    console.log(chalk.red(`Text too long: ${text.length}/500 characters`));
    process.exit(1);
  }

  try {
    console.log(chalk.gray('Posting reply...'));
    
    const result = await createTextPost(text, { replyTo: postId });
    const created = await getPost(result.id);
    
    console.log(chalk.green('\n✓ Reply posted!'));
    console.log(chalk.dim(`ID: ${result.id}`));
    
    if (created.permalink) {
      console.log(chalk.cyan(`\n${created.permalink}`));
    }
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
