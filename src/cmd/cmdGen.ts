import { CONF_GENERATORS, PLOP_FILE } from "../const/config";
import type { CmdFn } from "../entities/CmdFn";
import type { GeneratorsConfig } from "../entities/Generators";
import { findConfig } from "../path/findConfig";
import { findPlopPath } from "../path/findPlopPath";
import { pathConstructor } from "../path/pathConstructor";
import { formatError } from "../utils/formatError";
import { logError, logger } from "../utils/logger";
import { deepFilePlop } from "./utils/filePlop";
import { findFilePlopArgs } from "./utils/findFilePlopArgs";
import { mergeGeneratorConfig } from "./utils/generators";

export const cmdGen: CmdFn = ({
	program,
	name,
	config,
	dir,
	defaultDir,
	stopSpinner,
}) => {
	program
		.command(name)
		.description("Generate elements by file(json)")
		.option("--out <path>", "Path to generate files")
		.option("--in <path>", 'Path to "gen.json" file or folder')
		.option("-f, --force", "force overwrites the existing file", false)
		.option("-d, --deep", 'use "genLink" params in ".gen.json"', false)
		.option(
			"-i, --ignore-dest",
			'Ignore the "genDest" key by default in the ".gen.json" file.',
			false,
		)
		.option("-t, --type-gen <path>", "choice type generators filter")
		.action(
			async ({
				typeGen,
				in: inPath,
				out: outPath,
				force,
				deep,
				ignoreDest,
			}) => {
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
					stopSpinner();
					await findFilePlopArgs({
						inPath,
						filePlopFn: async (argsList) => {
							const dest = await pathConstructor(outPath);
							await deepFilePlop({
								argsList,
								configPath,
								force,
								deep,
								dest,
								ignoreDest,
								generatorsConfig,
								typeGen,
							});
						},
					});
					process.exit(1);
				} catch (anyError) {
					logger("");
					const error = formatError(anyError);
					logError(error);
					process.exit(1);
				}
			},
		);
};
