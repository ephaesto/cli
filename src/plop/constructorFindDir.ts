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
	const defaultDir = getDirs(DIRS.DEFAULT_DIR) || "";
	let dir = getDirs(DIRS.DIR) || "";
	const dirnames = getDirnames();

	const root = getRoots(ROOTS.ROOT);
	if (root) {
		dir = path.join(root, `/${getGlobalConfig()?.cliFolder || CLI_FOLDER}`);
	}
	const allDirs = { defaultDir, dir, ...dirnames };

	return (name) => (extraPath) =>
		path.join(allDirs[name] || allDirs[DIRS.DIR], extraPath);
};
