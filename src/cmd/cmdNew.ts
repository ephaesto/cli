import { CmdFn } from "../entities/CmdFn";
import { formatError } from "../utils/formatError";
import { logError, logger } from "../utils/logger";
import { cmdPlop } from "./utils/cmdPlop";
import { findPlopPath } from "../path/findPlopPath";
import { finSkippedParams } from "./utils/finSkippedParams";
import { findArgs } from "./utils/findArgs";
import { Generators, GeneratorsConfig } from "../entities/Generators";
import { findConfig } from "../path/findConfig";
import { mergeGeneratorConfig } from "./utils/mergeGeneratorConfig";
import { setGenerators } from "../config/generators";
import { findGenerators } from "./utils/findGenerators";

export const cmdNew: CmdFn = ({program, config, dirname, defaultDirname, stopSpinner}) => {
    program.command('new')
    .description('Create new single element by plop generator')
    .argument('[string...]', 'Arguments for the generator')
    .option('--out <path>', 'Path to generate files', process.cwd())
    .option('-f, --force', 'force overwrites the existing file', false)
    .option('-t, --type-gen <path>', 'choice type generators filter')
    .allowUnknownOption(true)
    .action( async(defaultArgs, { force, out: outPath, typeGen }, command) => {
      try {
        const configPath = findPlopPath({dirname, defaultDirname, namePlopFile: config.plop || 'plopfile.ts' })
        const AllGeneratorsConfig = await findConfig<GeneratorsConfig>({dirname, defaultDirname, nameConfigFile: config.config || 'generators' })
        const generatorsConfig = mergeGeneratorConfig(AllGeneratorsConfig)
        const rawArgs = finSkippedParams(program, command);
        const args = findArgs(defaultArgs, rawArgs);
        stopSpinner();
        const generators = await findGenerators(generatorsConfig, typeGen)
        setGenerators(generators);
        await cmdPlop({args,configPath, dest: outPath, force});
        process.exit(1);
      } catch (anyError) {
        logger("");
        const error = formatError(anyError)
        logError(error);
        process.exit(1);
      }
    });
}