import path from "node:path";
import { getDirs } from "~/src/config/dirs";
import { getGlobalConfig } from "~/src/config/global";
import { getRoots } from "~/src/config/roots";
import { CLI_FOLDER } from "~/src/const/config";
import { DIRS } from "~/src/const/dirs";
import { ROOTS } from "~/src/const/roots";
import type { FindDir } from "~/src/entities/Generators";
import { getDirnames } from "../config/dirnames";

export const constructorFindDir = (): ((name?: string) => FindDir) => {
	let dir = getDirs(DIRS.DIR) || "";
	const dirnames = getDirnames();

	const root = getRoots(ROOTS.ROOT);
	if (root) {
		dir = path.join(root, `/${getGlobalConfig()?.cliFolder || CLI_FOLDER}`);
	}
	const allDirs = { dir, ...dirnames };

	return (name) =>
		({ nameDir = name || DIRS.DIR, extraPath = "" }) =>
			path.join(allDirs[nameDir] || allDirs[DIRS.DIR], extraPath || "");
};
