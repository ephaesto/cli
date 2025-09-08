import path from "node:path";
import get from "lodash.get";
import { getDirs } from "~/src/config/dirs";
import { getGlobalConfig } from "~/src/config/global";
import { getRoots } from "~/src/config/roots";
import { CLI_FOLDER, CONFIG_FILE, DIRNAMES_KEY } from "~/src/const/config";
import { DIRS } from "~/src/const/dirs";
import { ROOTS } from "~/src/const/roots";
import type { FindDir } from "~/src/entities/Generators";
import { readJson } from "~/src/utils/readJson";

export const constructorFindDir = (): ((name?: string) => FindDir) => {
	let dir = getDirs(DIRS.DIR) || "";
	let dirnames = {};

	const root = getRoots(ROOTS.ROOT);
	if (root) {
		const configCli = readJson(
			path.join(root, getGlobalConfig()?.configFile || CONFIG_FILE),
		);
		const dirnamesKey = getGlobalConfig()?.dirnamesKey || DIRNAMES_KEY;
		dirnames = get(configCli || {}, dirnamesKey, {});
		dir = path.join(root, `/${getGlobalConfig()?.cliFolder || CLI_FOLDER}`);
	}
	const allDirs = { dir, ...dirnames };

	return (name) =>
		({ nameDir = name || DIRS.DIR, extraPath = "" }) =>
			path.join(allDirs[nameDir] || allDirs[DIRS.DIR], extraPath || "");
};
