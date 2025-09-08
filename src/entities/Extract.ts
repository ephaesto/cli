import type { PlopGeneratorConfig } from "node-plop";

interface ExtractFindDirParams {
	nameDir?: string;
	extraPath?: string;
}

export type ExtractFindDir = (params: ExtractFindDirParams) => string;

type ExtractFn = (
	extractFindDir: ExtractFindDir,
) => Partial<PlopGeneratorConfig>;

export type ExtractConfig = Record<string, ExtractFn>;
export type Extracts = ExtractConfig;
