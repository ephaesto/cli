import nodePath from "node:path";
import { REG_IS_GEN_JSON } from "~/src/const/regexp";

export const isGenJson = (path: string): boolean => {
	const { base } = nodePath.parse(path);
	const regExp = REG_IS_GEN_JSON;
	return regExp.test(base);
};
