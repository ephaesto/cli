import { setGenerators } from "~/src/config/generators";
import { CONF_GENERATORS, PLOP_FILE } from "~/src/const/config";
import type { CmdFn } from "~/src/entities/CmdFn";
import type { GeneratorsConfig } from "~/src/entities/Generators";
import { findConfig } from "~/src/path/findConfig";
import { findPlopPath } from "~/src/path/findPlopPath";
import { pathConstructor } from "~/src/path/pathConstructor";
import { formatError } from "~/src/utils/formatError";
import { logError, logger } from "~/src/utils/logger";
import { cmdPlop } from "./utils/cmdPlop";
import { findArgs } from "./utils/findArgs";
import { findSkippedParams } from "./utils/findSkippedParams";
import { findGenerators, mergeGeneratorConfig } from "./utils/generators";

export const cmdNew: CmdFn = ({
	program,
	name,
	config,
	dir,
	defaultDir,
	stopSpinner,
	processTerm,
}) => {
	program
		.command(name)
		.description("Create new single element by plop generator")
		.argument("[string...]", "Arguments for the generator")
		.option("--out <path>", "Path to generate files", process.cwd())
		.option("-f, --force", "force overwrites the existing file", false)
		.option("-t, --type-gen <path>", "choice type generators filter")
		.option(
			"-p, --ignore-prompts",
			"Ignore check args by run plop prompts.",
			false,
		)
		.allowUnknownOption(true)
		.action(
			async (
				defaultArgs,
				{ force, out: outPath, typeGen, ignorePrompts },
				command,
			) => {
				try {
					const configPath = findPlopPath({
						dir,
						defaultDir,
						namePlopFile: config.plop || PLOP_FILE,
					});
					const AllGeneratorsConfig = await findConfig<GeneratorsConfig>({
						dir,
						defaultDir,
						nameConfigFile: config.config || CONF_GENERATORS,
					});
					const generatorsConfig = mergeGeneratorConfig(AllGeneratorsConfig);
					const rawArgs = findSkippedParams(program, command);
					const args = findArgs(defaultArgs, rawArgs);
					stopSpinner();
					const generators = await findGenerators({
						config: generatorsConfig,
						typeGen,
						processTerm,
					});
					setGenerators(generators);
					const dest = await pathConstructor(outPath);
					await cmdPlop({
						args,
						configPath,
						dest,
						force,
						processTerm,
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
