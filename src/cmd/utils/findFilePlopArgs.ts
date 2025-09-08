import { FilePathError } from "../../errors/FilePathError";
import { findAllGenJson } from "../../path/findAllGenJson";
import { isGenJson } from "../../path/isGenJson";
import { pathConstructor } from "../../path/pathConstructor";
import { pathValidating } from "../../path/pathValidating";

type filePlopFn = (argsList: string[]) => Promise<void>;
interface FindFilePlopArgsParams {
	filePlopFn: filePlopFn;
	inPath?: string;
}

export const findFilePlopArgs = async ({
	filePlopFn,
	inPath,
}: FindFilePlopArgsParams): Promise<void> => {
	const toGenFiles = await pathConstructor(inPath);
	const { isValidPath, isDirectory, isFile } = await pathValidating(toGenFiles);
	if (isValidPath) {
		const argsList: string[] = [];
		if (isDirectory) {
			const allGenFiles = await findAllGenJson(toGenFiles);
			argsList.push(...allGenFiles);
		} else if (isFile && isGenJson(toGenFiles)) {
			argsList.push(toGenFiles);
		} else {
			throw new FilePathError("Only '.gen.json' files are allowed.");
		}
		if (argsList.length) {
			await filePlopFn(argsList);
		}
	}
};
