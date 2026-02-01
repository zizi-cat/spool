import chalk from 'chalk';
import { post as browserPost, isLoggedIn, disconnect } from '../browser.js';

export async function post(text, options) {
  if (!text) {
    console.log(chalk.red('Post text is required.'));
    process.exit(1);
  }
  
  try {
    const loggedIn = await isLoggedIn();
    
    if (!loggedIn) {
      console.log(chalk.red('Not logged in to Threads.'));
      console.log(chalk.gray('Login to threads.com in your browser first.'));
      process.exit(1);
    }
    
    console.log(chalk.gray('Posting to Threads...'));
    
    const result = await browserPost(text);
    
    if (result.success) {
      console.log(chalk.green('✓ Posted successfully!'));
    }
  } catch (e) {
    console.log(chalk.red(`Error: ${e.message}`));
    process.exit(1);
  } finally {
    await disconnect();
  }
}
