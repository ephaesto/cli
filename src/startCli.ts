import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import merge from "lodash.merge";
import ora from "ora";
import oldConfig from "../.cli/config";
import { setDirs } from "./config/dirs";
import { setGlobalConfig } from "./config/global";
import { DESCRIPTION, NAME, VERSION } from "./const/config";
import type { CmdConfig } from "./entities/CmdConfig";
import { logger } from "./utils/logger";

const __defaultDirCli = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	`../${oldConfig.cliFolder}`,
);

const startCli = (currentConfig: CmdConfig, dir: string) => {
	logger("");
	const spinner = ora("Loading").start();
	setDirs({ dir, defaultDir: __defaultDirCli });
	const config: CmdConfig = merge(oldConfig, currentConfig);
	setGlobalConfig(config);
	const program = new Command();
	program
		.name(config.name || NAME)
		.description(config.description || DESCRIPTION)
		.version(config.version || VERSION);

	for (const [name, { cmdFn, ...params }] of Object.entries(
		config.command || {},
	)) {
		cmdFn({
			program,
			name,
			config: params,
			dir,
			defaultDir: __defaultDirCli,
			stopSpinner: () => spinner.stop(),
		});
	}

	program.parse();
};

export default startCli;
