import chalk from "chalk";
import type { ProcessTerm } from "~/src/entities/ProcessTerm";
import type { Starters } from "~/src/entities/Starters";
import { removeLine } from "~/src/prompts/removeLine";
import { searchList } from "~/src/prompts/searchList";
import { logger } from "~/src/utils/logger";

interface FindStarterParams {
	starters: Record<string, Starters>;
	processTerm: ProcessTerm;
	starterName?: string;
}

export const findStarter = async ({
	starters,
	starterName,
	processTerm,
}: FindStarterParams): Promise<Starters> => {
	if (starterName && starters[starterName]) {
		return starters[starterName];
	}

	if (starterName) {
		logger({
			processTerm,
			args: [
				chalk.yellow.bold("⚠"),
				chalk.yellow("Starter name"),
				chalk.cyanBright(starterName),
				chalk.yellow("isn't in the list"),
			],
		});
	}
	const starterNameList = Object.keys(starters);
	const message = "Please choose a name of starter list";
	const type = await searchList({
		message,
		list: starterNameList,
		processTerm,
	});
	removeLine({ processTerm, nb: 1 });
	return starters[type];
};
