import type { NodePlopAPI } from "plop";
import { getExtracts } from "~/src/config/extracts";
import { constructorExtractFindDir } from "~/src/plop/constructorExtractFindDir";
import setup from "~/src/plop/setup";

export default async function (plop: NodePlopAPI) {
	setup(plop);

	const extracts = getExtracts();
	const findDir = constructorExtractFindDir();

	for (const [name, extractsFn] of Object.entries(extracts)) {
		if (name && extractsFn) {
			plop.setGenerator(name, extractsFn(findDir));
		}
	}
}
