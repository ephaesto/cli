import type { GeneratorsConfig } from "~/src/entities/Generators";
import type { StarterConfig } from "~/src/entities/Starters";
import type { FindConfig } from "~/src/path/findConfig";

export const extractAllGeneratorsConfig = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<StarterConfig>): FindConfig<GeneratorsConfig> => {
	return {
		defaultDirConfig: defaultDirConfig?.generators || null,
		dirConfig: dirConfig?.generators || null,
		rootConfig: rootConfig?.generators || null,
	};
};
