import { cmdExtract } from "~/src/cmd/cmdExtract";
import { cmdGen } from "~/src/cmd/cmdGen";
import { cmdInit } from "~/src/cmd/cmdInit";
import { cmdNew } from "~/src/cmd/cmdNew";
import { cmdStart } from "~/src/cmd/cmdStart";
import type { CmdConfig } from "~/src/entities/CmdConfig";
import { addFolder } from "~/src/plop/actions/addFolder";
import { copy } from "~/src/plop/actions/copy";

const config: CmdConfig = {
	name: "grim",
	configFile: "config.cli.json",
	cliFolder: ".cli",
	rootKey: "root",
	dirnamesKey: "dirs",
	description: "CLI to some JavaScript string utilities",
	version: "0.0.0",
	command: {
		init: { cmdFn: cmdInit, plop: "plopfile/init.plopfile.ts" },
		extract: {
			cmdFn: cmdExtract,
			plop: "plopfile/extract.plopfile.ts",
			config: "extracts",
		},
		new: { cmdFn: cmdNew, plop: "plopfile/plopfile.ts", config: "generators" },
		gen: { cmdFn: cmdGen, plop: "plopfile/plopfile.ts", config: "generators" },
		start: {
			cmdFn: cmdStart,
			plop: "plopfile/plopfile.ts",
			config: "starters",
		},
	},
	actions: {
		copy,
		addFolder,
	},
};

export default config;
