import path from "node:path";
import { getDirs } from "~/src/config/dirs";
import { DIRS } from "~/src/const/dirs";
import { getDirnames } from "../config/dirnames";
import type { InitFindDir } from "../entities/Inits";

export const constructorInitFindDir = (): ((name?: string) => InitFindDir) => {
	const defaultDir = getDirs(DIRS.DEFAULT_DIR) || "";
	const dir = getDirs(DIRS.DIR) || "";
	const dirnames = getDirnames();

	const allDirs = { defaultDir, dir, ...dirnames };

	return (name) => (extraPath) =>
		path.join(allDirs[name] || allDirs[DIRS.DIR], extraPath);
};
