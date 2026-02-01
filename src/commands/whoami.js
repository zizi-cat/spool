import chalk from 'chalk';
import { isAuthenticated, getUser } from '../config.js';
import { getMe } from '../api.js';

export async function whoami() {
  if (!isAuthenticated()) {
    console.log(chalk.red('Not logged in. Run: spool login'));
    process.exit(1);
  }

  try {
    const me = await getMe();
    
    console.log(chalk.cyan('\n🧵 Your Threads Profile\n'));
    console.log(`${chalk.bold('Username:')} @${me.username}`);
    console.log(`${chalk.bold('Name:')}     ${me.name || chalk.dim('(not set)')}`);
    console.log(`${chalk.bold('ID:')}       ${me.id}`);
    
    if (me.threads_biography) {
      console.log(`${chalk.bold('Bio:')}      ${me.threads_biography}`);
    }
    
    console.log('');
  } catch (error) {
    console.log(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}
