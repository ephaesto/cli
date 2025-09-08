import chalk from "chalk";
import { setGenerators } from "../../../config/generators";
import { STARTER_TYPES } from "../../../const/starters";
import type { GeneratorsConfig } from "../../../entities/Generators";
import type {
	CmdPlopParams,
	FilePlopParams,
	Starter,
	StarterLink,
	StarterParams,
} from "../../../entities/Starter";
import { StarterConfigError } from "../../../errors/StarterConfigError";
import { pathConstructor } from "../../../path/pathConstructor";
import { searchList } from "../../../prompts/searchList";
import { logger } from "../../../utils/logger";
import { cmdPlop } from "../cmdPlop";
import { deepFilePlop } from "../filePlop";
import { findFilePlopArgs } from "../findFilePlopArgs";
import { findGenerators } from "../generators";
import { findStarter } from "../starter/findStarter";
import { filterValues } from "./filterValues";
import { findConstructorArg } from "./findConstructorArg";
import { formatArgs } from "./formatArgs";
import { formatStep } from "./formatStep";

interface ConstructorPlopParams {
	args: string[] | [string, Record<string, string>];
	configPath: string;
	generatorsConfig: GeneratorsConfig;
	starterConfig: Record<string, Starter>;
	force?: boolean;
	dest?: string;
	nameSpace?: string;
	filters?: Record<string, string>;
}

export const constructorPlop = async ({
	args: [starterName, ...newArgs],
	configPath,
	generatorsConfig,
	starterConfig,
	force = false,
	dest: globalDest = process.cwd(),
	nameSpace = "",
	filters = {},
}: ConstructorPlopParams): Promise<boolean> => {
	const { isArrayArgs, args: formattedArgs } = formatArgs(newArgs);

	const starter = await findStarter(starterConfig, starterName);
	for (const starterStep of Object.values(starter)) {
		const constructorStep = async (
			anyStep: StarterParams,
			innerFilters: Record<string, string>,
			args: string[] | Record<string, string>,
		) => {
			const { type, step } = formatStep(anyStep);
			switch (type) {
				case STARTER_TYPES.UNKNOWN:
					throw new StarterConfigError("bad starter format");
				case STARTER_TYPES.MULTI_CHOICE: {
					let value = findConstructorArg(args, step.name);
					const { type, step: StepValues } = formatStep(step.values);
					if ([STARTER_TYPES.FILTER, STARTER_TYPES.UNKNOWN].includes(type)) {
						let values = StepValues;
						if (type === STARTER_TYPES.FILTER) {
							values = filterValues<
								| Record<string, CmdPlopParams | FilePlopParams | StarterLink>
								| Record<string, string>
							>(StepValues, filters);
						}
						const list = Object.keys(values);
						if (!value || !list[value]) {
							if (value && !list[value]) {
								logger(
									chalk.yellow.bold("⚠"),
									chalk.yellow(step.name),
									chalk.cyanBright(value),
									chalk.yellow("isn't in the list"),
								);
							}
							value = await searchList({
								message: step.question,
								list: Object.keys(values),
							});
						}

						if (typeof StepValues[value] === "string") {
							innerFilters[`${nameSpace}${step.name}`] = StepValues[value];
							break;
						}
						innerFilters[`${nameSpace}${step.name}`] = value;
						await constructorStep(StepValues[value], innerFilters, args);
					}
					break;
				}
				case STARTER_TYPES.FILTER: {
					const valueFilter = filterValues<
						CmdPlopParams | FilePlopParams | StarterLink
					>(step, innerFilters);
					await constructorStep(valueFilter, innerFilters, args);
					break;
				}
				case STARTER_TYPES.STARTER:
					await constructorPlop({
						args: [step.starterName],
						configPath,
						generatorsConfig,
						starterConfig,
						force,
						dest: globalDest,
						nameSpace: `${nameSpace}${step.nameSpace}`,
						filters: innerFilters,
					});
					break;
				case STARTER_TYPES.CMD_PLOP: {
					const destCmd = await pathConstructor(globalDest);
					const generatorsCmd = await findGenerators(
						generatorsConfig,
						step.typeGen,
					);
					setGenerators(generatorsCmd);
					await cmdPlop({
						args: [step.generator, step.params || {}],
						configPath,
						dest: destCmd,
						force: step.force || force,
					});
					break;
				}
				case STARTER_TYPES.FILE_PLOP:
					await findFilePlopArgs({
						inPath: step.in,
						filePlopFn: async (argsList) => {
							const destFile = await pathConstructor(globalDest);
							await deepFilePlop({
								argsList,
								configPath,
								force: step.force || force,
								deep: step.deep,
								dest: destFile,
								ignoreDest: step.ignoreDest,
								generatorsConfig,
								typeGen: step.typeGen,
							});
						},
					});
					break;
			}
		};
		await constructorStep(
			starterStep,
			filters,
			isArrayArgs ? formattedArgs : formattedArgs,
		);
	}
	return true;
};
