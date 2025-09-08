import { CmdFn } from "../entities/CmdFn";
import { findPlopPath } from "../path/findPlopPath";
import { logError, logger } from "../utils/logger";
import { formatError } from "../utils/formatError";
import { cmdPlop } from "./utils/cmdPlop";

export const cmdInit: CmdFn = async ({program, name, config, dirname, stopSpinner,defaultDirname}) => {
    program
        .command(name)
        .description('initialize cli ')
        .option('-f, --force', 'force overwrites the existing file', false)
        .action( async({ force }) => {
            try {
                const configPath = findPlopPath({dirname, defaultDirname, namePlopFile: config.plop || 'plopfile.ts' })
                stopSpinner()
                await cmdPlop({args: ['init'],configPath : configPath, force})
                process.exit(1);
            } catch (anyError) {
                logger("");
                const error = formatError(anyError)
                logError(error);
                process.exit(1);
            }
        });
}