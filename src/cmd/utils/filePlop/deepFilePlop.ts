import { setGenerators } from "~/src/config/generators";
import { getRoots, setRoots } from "~/src/config/roots";
import { ROOTS } from "~/src/const/roots";
import type { RecordCamelCase } from "~/src/entities/CmdConfig";
import type { GeneratorsConfig } from "~/src/entities/Generators";
import type { GenObject } from "~/src/entities/GenObject";
import type { ProcessTerm } from "~/src/entities/ProcessTerm";
import { findParentConfig } from "~/src/path/findParentConfig";
import { findRoots } from "~/src/path/findRoots";
import { findGenerators } from "../generators";
import { filePlop } from "./filePlop";

interface DeepFilePlopParams {
	argsList: (string | GenObject)[];
	configPath: string;
	generatorsConfig: GeneratorsConfig;
	force?: boolean;
	deep?: boolean;
	dest?: string;
	ignoreDest?: boolean;
	typeGen?: string;
	processTerm: ProcessTerm;
	genFileName?: string;
	parentConfig: RecordCamelCase<string, string>;
}
export const deepFilePlop = async ({
	argsList,
	configPath,
	force = false,
	dest = process.cwd(),
	ignoreDest = false,
	typeGen,
	deep = false,
	generatorsConfig,
	processTerm,
	genFileName,
	parentConfig,
}: DeepFilePlopParams): Promise<boolean> => {
	const generators = await findGenerators({
		config: generatorsConfig,
		typeGen,
		processTerm,
	});
	setGenerators(generators);
	for (const args of argsList) {
		let innerParentConfig = parentConfig;
		const parent = getRoots(ROOTS.PARENT);
		if (parent && !dest.startsWith(parent) && !generators.subGenConf) {
			const currentRoots = findRoots();
			setRoots(currentRoots);
			const generators = await findGenerators({
				config: generatorsConfig,
				typeGen,
				processTerm,
			});
			setGenerators(generators);
			innerParentConfig = findParentConfig();
		}
		const {
			argsList: childArgsList,
			dest: childDest,
			genFileName: childGenFileName,
		} = await filePlop({
			args,
			configPath,
			force,
			oldDest: dest,
			ignoreDest,
			deep,
			processTerm,
			oldGenFileName: genFileName,
			parentConfig: innerParentConfig,
		});
		await deepFilePlop({
			argsList: childArgsList,
			dest: childDest,
			genFileName: childGenFileName,
			configPath,
			force,
			deep,
			generatorsConfig,
			processTerm,
			parentConfig: innerParentConfig,
		});
		setRoots({ [ROOTS.PARENT]: parent });
	}
	return true;
};
