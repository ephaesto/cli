import { setExtracts } from "../config/extracts";
import { CONF_EXTRACTS, INIT_PLOP_FILE } from "../const/config";
import type { CmdFn } from "../entities/CmdFn";
import type { ExtractConfig } from "../entities/Extract";
import { findConfig } from "../path/findConfig";
import { findPlopPath } from "../path/findPlopPath";
import { pathConstructor } from "../path/pathConstructor";
import { formatError } from "../utils/formatError";
import { logError, logger } from "../utils/logger";
import { cmdPlop } from "./utils/cmdPlop";
import { findArgs } from "./utils/findArgs";
import { findSkippedParams } from "./utils/findSkippedParams";
import { mergeExtractsConfig } from "./utils/mergeExtractsConfig";

export const cmdExtract: CmdFn = ({
	program,
	name,
	config,
	dir,
	defaultDir,
	stopSpinner,
}) => {
	program
		.command(name)
		.description("Create new single element by plop generator")
		.argument("[string...]", "Arguments for the generator")
		.option("--out <path>", "Path to generate files", process.cwd())
		.option("--in <path>", "Path to extract file or folder")
		.option("-f, --force", "force overwrites the existing file", false)
		.allowUnknownOption(true)
		.action(async (defaultArgs, { force, out: outPath }, command) => {
			try {
				const configPath = findPlopPath({
					dir,
					defaultDir,
					namePlopFile: config.plop || INIT_PLOP_FILE,
				});
				const AllGeneratorsConfig = await findConfig<ExtractConfig>({
					dir,
					defaultDir,
					nameConfigFile: config.config || CONF_EXTRACTS,
				});
				const extracts = mergeExtractsConfig(AllGeneratorsConfig);
				const rawArgs = findSkippedParams(program, command);
				const args = findArgs(defaultArgs, rawArgs);
				stopSpinner();
				setExtracts(extracts);
				const dest = await pathConstructor(outPath);
				await cmdPlop({ args, configPath, dest, force });
				process.exit(1);
			} catch (anyError) {
				logger("");
				const error = formatError(anyError);
				logError(error);
				process.exit(1);
			}
		});
};
