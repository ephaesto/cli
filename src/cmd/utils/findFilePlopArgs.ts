import type { RecordCamelCase } from "~/src/entities/CmdConfig";
import { FilePathError } from "~/src/errors/FilePathError";
import { findAllGenJson } from "~/src/path/findAllGenJson";
import { isGenFile } from "~/src/path/isGenFile";
import { pathConstructor } from "~/src/path/pathConstructor";
import { pathValidating } from "~/src/path/pathValidating";

type filePlopFn = (argsList: string[]) => Promise<void>;
interface FindFilePlopArgsParams {
	filePlopFn: filePlopFn;
	inPath?: string;
	parentConfig: RecordCamelCase<string, string> | null;
}

export const findFilePlopArgs = async ({
	filePlopFn,
	inPath,
	parentConfig,
}: FindFilePlopArgsParams): Promise<void> => {
	const toGenFiles = await pathConstructor(inPath);
	const { isValidPath, isDirectory, isFile } = await pathValidating(toGenFiles);
	if (isValidPath) {
		const argsList: string[] = [];
		if (isDirectory) {
			const allGenFiles = await findAllGenJson(toGenFiles);
			argsList.push(...allGenFiles);
		} else if (isFile && isGenFile(toGenFiles, parentConfig)) {
			argsList.push(toGenFiles);
		} else {
			throw new FilePathError("Only '.gen.json' files are allowed.");
		}
		if (argsList.length) {
			await filePlopFn(argsList);
		}
	}
};
