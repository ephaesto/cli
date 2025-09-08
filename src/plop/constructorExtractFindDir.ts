import path from "node:path";
import { getDirs } from "~/src/config/dirs";
import { getGlobalConfig } from "~/src/config/global";
import { getRoots } from "~/src/config/roots";
import { CLI_FOLDER } from "~/src/const/config";
import { DIRS } from "~/src/const/dirs";
import { REG_IS_DIRS } from "~/src/const/regexp";
import { ROOTS } from "~/src/const/roots";
import type { ExtractFindDir } from "~/src/entities/Extracts";
import { getDirnames } from "../config/dirnames";

export const constructorExtractFindDir = (): ((
	name?: string,
) => ExtractFindDir) => {
	let allDirs: Record<string, string> = {
		dir: getDirs(DIRS.DIR),
		defaultDir: getDirs(DIRS.DEFAULT_DIR),
	};
	const [first, ...inPath] = getDirs(DIRS.IN_PATH)?.split("/") || [];
	let innerName: string = "";
	let otherPath = "";
	if (first) {
		if (REG_IS_DIRS.test(first)) {
			innerName = first.match(REG_IS_DIRS)?.[1] || DIRS.DIR;
			otherPath = inPath.length ? inPath.join("/") : "";
		}
		otherPath = inPath.length ? inPath.join("/") : "";
	}

	const root = getRoots(ROOTS.ROOT);
	if (root) {
		const dirnames = getDirnames();
		const rootDir = path.join(
			root,
			`/${getGlobalConfig()?.cliFolder || CLI_FOLDER}`,
		);
		allDirs = { ...allDirs, rootDir, ...dirnames };
	}

	return (name) => (extraPath) =>
		path.join(
			allDirs[innerName || name] || allDirs[DIRS.DIR],
			otherPath || "",
			extraPath,
		);
};
