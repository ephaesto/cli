import chalk from "chalk";

export const logger = ( ...args:(string|object)[]  )=> {
    const formatted = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return arg;
      }).join(' ');
    
      process.stdout.write(`${formatted}\n`);
}

export const logError = (error: Error)=> logger(chalk.bgRed(error.name), chalk.red(error.message));