import fs from "node:fs/promises";
import { isGenJson } from "./isGenJson";

export const findAllGenJson = async (path: string): Promise<string[]> => {
	const dir = await fs.readdir(path, { withFileTypes: true });
	const allFiles = dir.filter(
		(item) => !item.isDirectory() && isGenJson(item.name),
	);
	return allFiles.map(({ name }) => name);
};
