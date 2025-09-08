import { CmdFn } from "../entities/CmdFn";
import { findPlopPath } from "../path/findPlopPath";
import { findConfig } from "../path/findConfig";
import { GeneratorsConfig } from "../entities/Generators";
import nodePlop from "node-plop";
import { setGenerators } from "../config/generators";
import controllerff from "../../.cli/templates/controllerff";
import { logError, logger } from "../utils/logger";
import { formatError } from "../utils/formatError";

export const cmdTest: CmdFn = async ({program, name, config, dirname, stopSpinner,defaultDirname}) => {
    program.command(name)
    .description('test')
    .action( async(args) => {
        try {
            const configPath = findPlopPath({dirname, defaultDirname, namePlopFile: config.plop || 'plopfile.ts' })
            const AllConfig = await findConfig<GeneratorsConfig>({dirname, defaultDirname,nameConfigFile: config.config|| 'generators' })
            stopSpinner()
            setGenerators({test1: controllerff})
            await nodePlop(configPath);
            setGenerators({test2: controllerff})
            await nodePlop(configPath);
            console.log('init', dirname);
            console.log('init', config);
            process.exit(1);
        } catch (anyError) {
            logger("");
            const error = formatError(anyError)
            logError(error);
            process.exit(1);
        }
    });
}