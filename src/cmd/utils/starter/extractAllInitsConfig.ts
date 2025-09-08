import type { InitsConfig } from "~/src/entities/Inits";
import type { StarterConfig } from "~/src/entities/Starters";
import type { FindConfig } from "~/src/path/findConfig";

export const extractAllInitsConfig = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<StarterConfig>): FindConfig<InitsConfig> => {
	return {
		defaultDirConfig: defaultDirConfig?.inits || null,
		dirConfig: dirConfig?.inits || null,
		rootConfig: rootConfig?.inits || null,
	};
};
