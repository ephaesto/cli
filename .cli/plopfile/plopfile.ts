import type { NodePlopAPI } from "plop";
import { getGenerators } from "../../src/config/generators";
import { DIRS } from "../../src/const/dirs";
import { constructorFindDir } from "../../src/plop/constructorFindDir";
import setup from "../../src/plop/setup";

export default async function (plop: NodePlopAPI) {
	setup(plop);

	const generators = getGenerators();
	const findDir = constructorFindDir();

	for (const [name, generatorParams] of Object.entries(generators)) {
		let generatorsFn = generatorParams;
		let nameDir = DIRS.DIR;
		if (
			typeof generatorsFn === "object" &&
			generatorParams?.["generatorsFn"] &&
			generatorParams?.["nameDir"]
		) {
			generatorsFn = generatorParams["generatorsFn"];
			nameDir = generatorParams["nameDir"];
		}

		if (name && typeof generatorsFn === "function") {
			plop.setGenerator(name, generatorsFn(findDir(nameDir)));
		}
	}
}
