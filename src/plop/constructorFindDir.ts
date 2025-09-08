import path from "node:path";
import get from "lodash.get";
import { getDirs } from "../config/dirs";
import { getGlobalConfig } from "../config/global";
import { getRoots } from "../config/roots";
import { CLI_FOLDER, CONFIG_FILE, DIRNAMES_KEY } from "../const/config";
import { DIRS } from "../const/dirs";
import { ROOTS } from "../const/roots";
import type { FindDir } from "../entities/Generators";
import { readJson } from "../utils/readJson";

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
