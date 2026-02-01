import chalk from 'chalk';
import { isLoggedIn, getProfile, disconnect } from '../browser.js';

export async function whoami() {
  try {
    const loggedIn = await isLoggedIn();
    
    if (!loggedIn) {
      console.log(chalk.red('Not logged in to Threads.'));
      console.log(chalk.gray('Login to threads.com in your browser first.'));
      process.exit(1);
    }
    
    const profile = await getProfile();
    
    if (profile?.username) {
      console.log(chalk.green(`✓ Logged in as @${profile.username}`));
      console.log(chalk.gray(`User ID: ${profile.id}`));
    } else {
      console.log(chalk.yellow('Logged in but could not get profile info.'));
    }
  } catch (e) {
    console.log(chalk.red(`Error: ${e.message}`));
    process.exit(1);
  } finally {
    await disconnect();
  }
}
