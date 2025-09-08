import chalk from "chalk";
import nodePlop from "node-plop";
import { searchGenerator } from "~/src/prompts/searchGenerator";
import { logger } from "~/src/utils/logger";
import { clearQuestions } from "./clearQuestions";
import { constructorArgsPlop } from "./constructorArgsPlop";

interface CmdPlopParams {
	args: string[] | [string, Record<string, string>];
	configPath: string;
	force?: boolean;
	dest?: string | undefined;
}
export const cmdPlop = async ({
	args: [genName, ...newArgs],
	configPath,
	force = false,
	dest = process.cwd(),
}: CmdPlopParams): Promise<boolean> => {
	const plop = await nodePlop(configPath, {
		force,
		destBasePath: dest,
	});
	const generatorList = plop.getGeneratorList();
	let generatorName = genName || "";
	const generatorNotInList = !generatorList
		.map(({ name }) => name)
		.includes(generatorName);

	if (!generatorName || (generatorName && generatorNotInList)) {
		let message = "Please choose a generator";
		if (generatorName && generatorNotInList) {
			logger(
				chalk.yellow.bold("⚠"),
				chalk.yellow("Generator"),
				chalk.cyanBright(generatorName),
				chalk.yellow("isn't in the list"),
			);
			message = "Please choose a valid generator";
		}
		generatorName = await searchGenerator({ message, generatorList });
	} else {
		logger(
			chalk.green.bold("✦"),
			chalk.bold("You use generator"),
			chalk.cyanBright(generatorName),
		);
	}
	const generator = plop.getGenerator(generatorName);

	const args = constructorArgsPlop(newArgs, generator.prompts);
	const sanitizeArgs = await generator.runPrompts(args);
	clearQuestions(args, sanitizeArgs);

	const { changes, failures } = await generator.runActions(sanitizeArgs);

	changes.forEach(({ type, path }) => {
		logger(chalk.green("✔"), chalk.blueBright.bold.italic(`[${type}]`), path);
	});
	failures.forEach(({ type, error }) => {
		logger(chalk.red("✖"), chalk.blueBright.bold.italic(`[${type}]`), error);
	});
	logger("");
	return true;
};
