import chalk from 'chalk';
import { DotenvConfig } from '../config/env.config';
import { Logger } from '../config/logger.config';
import { Environment } from '../constant/enum';

const log = console.log;

class Print {
  static error(message: string): void {
    if (DotenvConfig.NODE_ENV === Environment.DEVELOPMENT)
      log(chalk.bgRed(message));
    Logger.error(message);
  }

  static info(message: string): void {
    if (DotenvConfig.NODE_ENV === Environment.DEVELOPMENT)
      log(chalk.green(message));
    Logger.info(message);
  }

  static warn(message: string): void {
    if (DotenvConfig.NODE_ENV === Environment.DEVELOPMENT)
      log(chalk.yellow(message));
    Logger.warn(message);
  }

  static debug(message: string): void {
    if (DotenvConfig.NODE_ENV === Environment.DEVELOPMENT)
      log(chalk.blue(message));
    Logger.debug(message);
  }
}

export default Print;
