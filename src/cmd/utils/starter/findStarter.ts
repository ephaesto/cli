import chalk from "chalk";
import type { Starter } from "../../../entities/Starter";
import { removeLine } from "../../../prompts/removeLine";
import { searchList } from "../../../prompts/searchList";
import { logger } from "../../../utils/logger";

export const findStarter = async (
	Starters: Record<string, Starter>,
	starterName?: string,
): Promise<Starter> => {
	if (starterName && Starters[starterName]) {
		return Starters[starterName];
	}

	if (starterName) {
		logger(
			chalk.yellow.bold("⚠"),
			chalk.yellow("Starter name"),
			chalk.cyanBright(starterName),
			chalk.yellow("isn't in the list"),
		);
	}
	const starterNameList = Object.keys(Starters);
	const message = "Please choose a name of starter list";
	const type = await searchList({ message, list: starterNameList });
	removeLine(1);
	return Starters[type];
};
