import merge from "lodash.merge";
import type { Extracts, ExtractsConfig } from "~/src/entities/Extracts";
import type { FindConfig } from "~/src/path/findConfig";

export const mergeExtractsConfig = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<ExtractsConfig>): Extracts => {
	const currentDefaultDirGenConfig = defaultDirConfig || {};
	const currentDirConfig = dirConfig || {};
	const currentRootGenConfig = rootConfig || {};

	return merge(
		currentDefaultDirGenConfig,
		currentDirConfig,
		currentRootGenConfig,
	);
};
