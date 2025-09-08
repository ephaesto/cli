import fs from "node:fs";
import path from "node:path";
import { getGlobalConfig } from "../config/global";
import { getRoots, setRoots } from "../config/roots";
import { CONFIG_FILE, CONFIG_FILE_EXT } from "../const/config";
import { ROOTS } from "../const/roots";
import type { RecordCamelCase } from "../entities/CmdConfig";
import { readConfigCliFile } from "../utils/readConfigCliFile";
import { findRoots } from "./findRoots";

export const findParentConfig = (): RecordCamelCase<string, string> | null => {
	let parent = getRoots(ROOTS.PARENT);
	if (!parent) {
		const currentRoots = findRoots();
		if (currentRoots?.["~"]) {
			setRoots(currentRoots);
		}
		parent = currentRoots["~"];
	}
	const filename = getGlobalConfig()?.configFile || CONFIG_FILE;
	const ext = getGlobalConfig()?.configFileExt || CONFIG_FILE_EXT;
	const parentConfig = path.join(parent || "./", `${filename}.${ext}`);

	if (fs.existsSync(parentConfig)) {
		return readConfigCliFile(parentConfig);
	}

	return null;
};
