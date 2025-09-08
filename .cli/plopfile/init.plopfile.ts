import type { NodePlopAPI } from "plop";
import { getGlobalConfig } from "../../src/config/global";
import { CLI_FOLDER, CONFIG_FILE } from "../../src/const/config";
import { INIT } from "../../src/const/init";
import setup from "../../src/plop/setup";

export default async function (plop: NodePlopAPI) {
	setup(plop);
	const configFile = getGlobalConfig()?.configFile || CONFIG_FILE;
	const cliFolder = getGlobalConfig()?.cliFolder || CLI_FOLDER;

	plop.setGenerator(INIT, init(configFile, cliFolder));
}
