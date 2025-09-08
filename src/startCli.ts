import { Command } from "commander";
import { CmdConfig } from "./entities/CmdConfig";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ora from 'ora';
import merge from 'lodash.merge';
import oldConfig from "../.cli/config";
import { setGlobalConfig } from "./config/global";
import { logger } from "./utils/logger";

const __dirFolderCli = path.join(path.dirname(fileURLToPath(import.meta.url)), `../${oldConfig.cliFolder}`);

const startCli = (currentConfig: CmdConfig, dirname: string) => {
    logger('')
    const spinner = ora('Loading').start();

    const config: CmdConfig = merge(oldConfig,currentConfig)
    setGlobalConfig(config)
    const program = new Command()
    program
        .name(config.name || 'grim')
        .description(config.description || 'CLI to some JavaScript string utilities')
        .version(config.version || '0.0.0');

    for (const [name, {cmdFn, ...params}] of Object.entries(config.command || {})) {
        cmdFn({program, name,  config: params, dirname, defaultDirname: __dirFolderCli, stopSpinner: () => spinner.stop() })
    }

    program.parse(); 
}

export default startCli