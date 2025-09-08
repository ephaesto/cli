import path from "node:path";
import get from "lodash.get";
import { getDirs } from "~/src/config/dirs";
import { getGlobalConfig } from "~/src/config/global";
import { getRoots } from "~/src/config/roots";
import { CLI_FOLDER, CONFIG_FILE, DIRNAMES_KEY } from "~/src/const/config";
import { DIRS } from "~/src/const/dirs";
import { REG_IS_DIRS } from "~/src/const/regexp";
import { ROOTS } from "~/src/const/roots";
import type { ExtractFindDir } from "~/src/entities/Extract";
import { readJson } from "~/src/utils/readJson";

export const constructorExtractFindDir = (): ExtractFindDir => {
	let allDirs = {
		dir: getDirs(DIRS.DIR),
		defaultDir: getDirs(DIRS.DEFAULT_DIR),
	};
	const [first, ...inPath] = getDirs(DIRS.IN_PATH)?.split("/") || [];
	let name: string = DIRS.DIR;
	let otherPath = "";
	if (first) {
		if (REG_IS_DIRS.test(first)) {
			name = first.match(REG_IS_DIRS)?.[1] || DIRS.DIR;
			otherPath = inPath.length ? inPath.join("/") : "";
		}
		otherPath = inPath.length ? inPath.join("/") : "";
	}

	const root = getRoots(ROOTS.ROOT);
	if (root) {
		const configCli = readJson(
			path.join(root, getGlobalConfig()?.configFile || CONFIG_FILE),
		);
		const dirnamesKey = getGlobalConfig()?.dirnamesKey || DIRNAMES_KEY;
		const dirnames = get(configCli || {}, dirnamesKey, {});
		const rootDir = path.join(
			root,
			`/${getGlobalConfig()?.cliFolder || CLI_FOLDER}`,
		);
		allDirs = { ...allDirs, rootDir, ...dirnames };
	}

	return ({ nameDir, extraPath }) =>
		path.join(
			allDirs[nameDir || name] || allDirs[DIRS.DIR],
			otherPath || "",
			extraPath || "",
		);
};
