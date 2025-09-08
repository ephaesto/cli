import type { PlopGeneratorConfig } from "node-plop";

interface FindDirParams {
	nameDir?: string;
	extraPath?: string;
}

export type FindDir = (params: FindDirParams) => string;

type GeneratorsFn = (findDir: FindDir) => Partial<PlopGeneratorConfig>;

export type Generators = Record<
	string,
	GeneratorsFn | { generatorsFn: GeneratorsFn; nameDir: string }
>;
export type GeneratorsConfig =
	| {
			subGenConf: true;
			[x: string]: Generators | true;
	  }
	| Generators;
