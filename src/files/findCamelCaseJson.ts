import fs from "node:fs";

type RecordCamelCase<T extends string | number | symbol, U> = Record<T, U>;

export const readCamelCaseJson = (
	path: string,
): RecordCamelCase<string, string> => {
	try {
		const content = fs.readFileSync(path, "utf-8");
		return JSON.parse(content);
	} catch (error) {
		console.error(`Failed to read or parse JSON at ${path}`, error);
		return null;
	}
};

export const writeCamelCaseJson = (
	path: string,
	data: RecordCamelCase<string, string>,
): void => {
	try {
		fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
	} catch (error) {
		console.error(`Failed to write JSON to ${path}`, error);
	}
};
