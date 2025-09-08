import merge from "lodash.merge";
import type { ExtractConfig, Extracts } from "../../entities/Extract";
import type { FindConfig } from "../../path/findConfig";

export const mergeExtractsConfig = ({
	dirConfig,
	defaultDirConfig,
	rootConfig,
}: FindConfig<ExtractConfig>): Extracts => {
	const dirGenConfig = dirConfig || {};
	const defaultDirGenConfig = defaultDirConfig || {};
	const rootGenConfig = rootConfig || {};
	return merge(merge(defaultDirGenConfig, dirGenConfig), rootGenConfig);
};
