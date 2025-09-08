import { cmdExtract } from "~/src/cmd/cmdExtract";
import { cmdGen } from "~/src/cmd/cmdGen";
import { cmdInit } from "~/src/cmd/cmdInit";
import { cmdNew } from "~/src/cmd/cmdNew";
import { cmdStart } from "~/src/cmd/cmdStart";
import type { CmdConfig } from "~/src/entities/CmdConfig";
import {
	readCamelCaseJson,
	stringToCamelCaseJson,
	writeCamelCaseJson,
} from "~/src/files/findCamelCaseJson";
import { addFolder } from "~/src/plop/actions/addFolder";
import { addTo } from "~/src/plop/actions/addTo";
import { copy } from "~/src/plop/actions/copy";
import { copyFolder } from "~/src/plop/actions/copyFolder";
import { copyTo } from "~/src/plop/actions/copyTo";

const config: CmdConfig = {
	name: "grim",
	cliFolder: ".cli",
	rootKey: "root", //camelCase
	dirnamesFile: "dirnames",
	description: "CLI to some JavaScript string utilities",
	version: "0.0.0",
	configFile: "config.cli",
	configFileExt: "json",
	configFileType: "camelCase",
	genFileExt: "json",
	genFileType: "camelCase",
	findFile: {
		json: {
			camelCase: {
				read: readCamelCaseJson,
				write: writeCamelCaseJson,
				stringTo: stringToCamelCaseJson,
			},
		},
	},
	commands: {
		init: {
			cmdFn: cmdInit,
			plop: "plopfile/init.plopfile.ts",
			config: "inits",
		},
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
		copyTo,
		addTo,
		copyFolder,
	},
};

export default config;
