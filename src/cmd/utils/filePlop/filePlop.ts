import chalk from "chalk";
import nodePlop from "node-plop";
import type { GenObject } from "~/src/entities/GenObject";
import { FileGenObjectError } from "~/src/errors/FileGenObjectError";
import { pathConstructor } from "~/src/path/pathConstructor";
import { logger } from "~/src/utils/logger";
import { readJson } from "~/src/utils/readJson";
import { sanitizeGenObject } from "./sanitizeGenJson";
import { separateArgsAndGenObject } from "./separateArgsAndGenObject";

interface FilePlopParams {
	args: string | GenObject;
	configPath: string;
	force?: boolean;
	deep?: boolean;
	oldDest?: string;
	ignoreDest?: boolean;
}
export const filePlop = async ({
	args: currentArgs,
	configPath,
	oldDest = process.cwd(),
	force = false,
	deep = false,
	ignoreDest = false,
}: FilePlopParams): Promise<{
	argsList: (string | GenObject)[];
	dest: string;
}> => {
	let anyArgs: string | GenObject;
	if (typeof currentArgs === "string") {
		anyArgs = readJson(currentArgs);
	} else {
		anyArgs = currentArgs;
	}
	const {
		isGenObject,
		isArrays,
		args: sanitizeArgs,
	} = sanitizeGenObject(anyArgs);
	if (!isGenObject) {
		throw new FileGenObjectError("Only '.gen.json' files are allowed.");
	}
	if (isArrays) {
		throw new FileGenObjectError("Only one '.gen.json' files are allowed.");
	}

	const { genName, genDest, argsList, args } = separateArgsAndGenObject(
		sanitizeArgs as GenObject,
		deep,
		ignoreDest,
	);

	const dest = await pathConstructor(genDest, oldDest);
	const plop = await nodePlop(configPath, {
		force,
		destBasePath: dest,
	});
	logger(
		chalk.green.bold("✦"),
		chalk.bold("You use generator"),
		chalk.cyanBright(genName),
	);
	const generator = plop.getGenerator(genName);
	const { changes, failures } = await generator.runActions(args);
	changes.forEach(({ type, path }) => {
		logger(chalk.green("✔"), chalk.blueBright.bold.italic(`[${type}]`), path);
	});
	failures.forEach(({ type, error }) => {
		logger(chalk.red("✖"), chalk.blueBright.bold.italic(`[${type}]`), error);
	});
	return { argsList, dest };
};
