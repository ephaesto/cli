import fs from "node:fs/promises";
import { formatError } from "~/src/utils/formatError";
import { logError } from "~/src/utils/logger";

export interface PathValidating {
	isValidPath: boolean;
	isDirectory: boolean;
	isFile: boolean;
}

export const pathValidating = async (path: string): Promise<PathValidating> => {
	try {
		const stats = await fs.stat(path);
		const isFile = stats.isFile();
		return {
			isValidPath: true,
			isDirectory: stats.isDirectory(),
			isFile,
		};
	} catch (anyError) {
		const error = formatError(anyError);
		logError(error);
		return {
			isValidPath: false,
			isDirectory: false,
			isFile: false,
		};
	}
};
