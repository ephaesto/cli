import { CONF_INITS, INIT_PLOP_FILE } from "~/src/const/config";
import { DEFAULT_INIT } from "~/src/const/init";
import type { CmdFn } from "~/src/entities/CmdFn";
import { findPlopPath } from "~/src/path/findPlopPath";
import { formatError } from "~/src/utils/formatError";
import { logError, logger } from "~/src/utils/logger";
import { getGlobalConfig } from "../config/global";
import { setInits } from "../config/inits";
import type { InitsConfig } from "../entities/Inits";
import { findConfig } from "../path/findConfig";
import { pathConstructor } from "../path/pathConstructor";
import { cmdPlop } from "./utils/cmdPlop";
import { findArgs } from "./utils/findArgs";
import { findSkippedParams } from "./utils/findSkippedParams";
import { mergeInitsConfig } from "./utils/mergeInitsConfig";

export const cmdInit: CmdFn = async ({
	program,
	name,
	config,
	dir,
	stopSpinner,
	defaultDir,
	processTerm,
}) => {
	program
		.command(name)
		.description("initialize cli ")
		.argument("[string...]", "Arguments for the generator")
		.option("-f, --force", "force overwrites the existing file", false)
		.option("--out <path>", "Path to generate files", process.cwd())
		.option(
			"-p, --ignore-prompts",
			"Ignore check args by run plop prompts.",
			false,
		)
		.allowUnknownOption(true)
		.action(
			async (defaultArgs, { force, out: outPath, ignorePrompts }, command) => {
				try {
					const configPath = findPlopPath({
						dir,
						defaultDir,
						namePlopFile: config.plop || INIT_PLOP_FILE,
					});
					const AllInitsConfig = await findConfig<InitsConfig>({
						dir,
						defaultDir,
						nameConfigFile: config.config || CONF_INITS,
					});
					const initsConfig = mergeInitsConfig(AllInitsConfig);
					const rawArgs = findSkippedParams(program, command);
					const args = findArgs(defaultArgs, rawArgs);
					stopSpinner();
					setInits(initsConfig);
					const dest = await pathConstructor(outPath);
					await cmdPlop({
						args: args.length
							? args
							: [
									DEFAULT_INIT,
									getGlobalConfig().configFileExt,
									getGlobalConfig().configFileType,
								],
						configPath: configPath,
						force,
						processTerm,
						dest,
						ignorePrompts,
					});
					processTerm.exit(0);
				} catch (anyError) {
					logger({ processTerm, args: [""] });
					const error = formatError(anyError);
					logError({ processTerm, error });
					processTerm.exit(1);
				}
			},
		);
};
