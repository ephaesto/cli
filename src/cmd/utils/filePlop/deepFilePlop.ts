import { setGenerators } from "../../../config/generators";
import { getRoots, setRoots } from "../../../config/roots";
import { ROOTS } from "../../../const/roots";
import type { GeneratorsConfig } from "../../../entities/Generators";
import type { GenObject } from "../../../entities/GenObject";
import { findRoots } from "../../../path/findRoots";
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
}: DeepFilePlopParams): Promise<boolean> => {
	const generators = await findGenerators(generatorsConfig, typeGen);
	setGenerators(generators);
	for (const args of argsList) {
		const parent = getRoots(ROOTS.PARENT);
		if (parent && !dest.startsWith(parent) && !generators.subGenConf) {
			const currentRoots = findRoots();
			setRoots(currentRoots);
			const generators = await findGenerators(generatorsConfig, typeGen);
			setGenerators(generators);
		}
		const { argsList: childArgsList, dest: childDest } = await filePlop({
			args,
			configPath,
			force,
			oldDest: dest,
			ignoreDest,
			deep,
		});
		await deepFilePlop({
			argsList: childArgsList,
			configPath,
			force,
			dest: childDest,
			deep,
			generatorsConfig,
		});
		setRoots({ [ROOTS.PARENT]: parent });
	}
	return true;
};
