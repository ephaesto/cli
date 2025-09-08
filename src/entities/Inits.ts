import type { PlopGeneratorConfig } from "node-plop";

interface InitFindDirParams {
	nameDir?: string;
	extraPath?: string;
}

export type InitFindDir = (params: InitFindDirParams) => string;

type InitFn = (initFindDir: InitFindDir) => Partial<PlopGeneratorConfig>;

export type InitsConfig = Record<string, InitFn>;
export type Inits = InitsConfig;
