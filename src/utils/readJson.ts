import fs from "node:fs";

export const readJson = (path: string) =>
	JSON.parse(fs.readFileSync(path, "utf-8"));
