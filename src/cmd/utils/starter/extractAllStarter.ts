import type { Starter, StarterConfig } from "../../../entities/Starter";
import type { FindConfig } from "../../../path/findConfig";

export const extractAllStarter = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<StarterConfig>): FindConfig<Record<string, Starter>> => {
	return {
		defaultDirConfig: defaultDirConfig?.starters || null,
		dirConfig: dirConfig?.starters || null,
		rootConfig: rootConfig?.starters || null,
	};
};
