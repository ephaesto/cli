import fs from "node:fs";
import path from "node:path";
import get from "lodash.get";
import { getGlobalConfig } from "~/src/config/global";
import { CONFIG_FILE, ROOT_KEY } from "~/src/const/config";
import { ROOTS } from "~/src/const/roots";
import type { Roots } from "~/src/entities/Roots";
import { readJson } from "~/src/utils/readJson";

export const findRoots = (findRoot = false): Roots => {
	let currentDir = process.cwd();
	const filename = getGlobalConfig()?.configFile || CONFIG_FILE;
	const roots: Roots = {
		[ROOTS.PARENT]: null,
		[ROOTS.ROOT]: null,
	};
	while (true) {
		const filePath = path.join(currentDir, filename);

		if (fs.existsSync(filePath)) {
			const configCli = readJson(filePath);
			const rootKey = getGlobalConfig()?.rootKey || ROOT_KEY;
			const root = get(configCli || {}, rootKey, {});
			if (root) {
				roots[ROOTS.ROOT] = path.dirname(filePath);
			}
			if (findRoot && roots[ROOTS.ROOT]) {
				return roots;
			}
			roots[ROOTS.PARENT] = path.dirname(filePath);
			return roots;
		}

		const parentDir = path.dirname(currentDir);
		if (parentDir === currentDir) {
			break;
		}
		currentDir = parentDir;
	}

	return roots;
};
