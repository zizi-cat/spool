import chalk from 'chalk';
import { isAuthenticated } from '../config.js';
import { createTextPost, createImagePost, getPost } from '../api.js';

export async function post(text, options) {
  if (!isAuthenticated()) {
    console.log(chalk.red('Not logged in. Run: spool login'));
    process.exit(1);
  }

  if (!text || text.trim().length === 0) {
    console.log(chalk.red('Text is required.'));
    process.exit(1);
  }

  if (text.length > 500) {
    console.log(chalk.red(`Text too long: ${text.length}/500 characters`));
    process.exit(1);
  }

  try {
    console.log(chalk.gray('Creating thread...'));
    
    let result;
    if (options.image) {
      result = await createImagePost(text, options.image);
    } else {
      result = await createTextPost(text);
    }
    
    // Fetch the created post to get permalink
    const created = await getPost(result.id);
    
    console.log(chalk.green('\n✓ Thread posted!'));
    console.log(chalk.dim(`ID: ${result.id}`));
    
    if (created.permalink) {
      console.log(chalk.cyan(`\n${created.permalink}`));
    }
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
    if (error.response) {
      console.log(chalk.dim(JSON.stringify(error.response, null, 2)));
    }
    process.exit(1);
  }
}
