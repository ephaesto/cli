import type { StarterConfig, Starters } from "~/src/entities/Starters";
import type { FindConfig } from "~/src/path/findConfig";

export const extractAllStarter = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<StarterConfig>): FindConfig<Record<string, Starters>> => {
	return {
		defaultDirConfig: defaultDirConfig?.starters || null,
		dirConfig: dirConfig?.starters || null,
		rootConfig: rootConfig?.starters || null,
	};
};
