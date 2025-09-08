import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { getGlobalConfig } from "../../../config/global";
import { getRoots, setRoots } from "../../../config/roots";
import { CONFIG_FILE } from "../../../const/config";
import type {
	Generators,
	GeneratorsConfig,
} from "../../../entities/Generators";
import { findRoots } from "../../../path/findRoots";
import { removeLine } from "../../../prompts/removeLine";
import { searchList } from "../../../prompts/searchList";
import { logger } from "../../../utils/logger";
import { readJson } from "../../../utils/readJson";

export const findGenerators = async (
	{ subGenConf, ...generatorsConfig }: GeneratorsConfig,
	typeGen?: string,
): Promise<Generators> => {
	if (!subGenConf) {
		return generatorsConfig as Generators;
	}
	if (typeGen && generatorsConfig[typeGen]) {
		return generatorsConfig[typeGen] as Generators;
	}
	let rootTypeGen = null;
	if (!typeGen) {
		let parent = getRoots("~");
		if (!parent) {
			const currentRoots = findRoots();
			setRoots(currentRoots);
			parent = currentRoots["~"];
		}
		const parentConfig = path.join(
			parent || "./",
			getGlobalConfig()?.configFile || CONFIG_FILE,
		);
		if (fs.existsSync(parentConfig)) {
			const { typeGen } = readJson(parentConfig);
			rootTypeGen = typeGen || "NO_TYPE";
		}
	}

	if (
		rootTypeGen &&
		rootTypeGen !== "NO_TYPE" &&
		generatorsConfig[rootTypeGen]
	) {
		return generatorsConfig[rootTypeGen] as Generators;
	}
	if (typeGen || (rootTypeGen && rootTypeGen !== "NO_TYPE")) {
		logger(
			chalk.yellow.bold("⚠"),
			chalk.yellow("Type Generators"),
			chalk.cyanBright(typeGen || rootTypeGen),
			chalk.yellow("isn't in the list"),
		);
	}
	const typeGenList = Object.keys(generatorsConfig);
	const message = "Please choose a type of generator list";
	const type = await searchList({ message, list: typeGenList });
	removeLine(1);
	return generatorsConfig[type] as Generators;
};
