import nodePath from "node:path";
import { getGlobalConfig } from "../config/global";
import { GEN_FILE_TYPE } from "../const/config";
import type { RecordCamelCase } from "../entities/CmdConfig";

export const isGenFile = (
	path: string,
	parentConfig: RecordCamelCase<string, string> | null,
): boolean => {
	const genFileExt =
		parentConfig?.genFileExt || getGlobalConfig()?.genFileExt || GEN_FILE_TYPE;
	const { base } = nodePath.parse(path);
	const regExp = new RegExp(`[.]gen[.]${genFileExt}`);
	return regExp.test(base);
};
