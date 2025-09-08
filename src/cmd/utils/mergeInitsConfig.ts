import merge from "lodash.merge";
import type { Inits, InitsConfig } from "~/src/entities/Inits";
import type { FindConfig } from "~/src/path/findConfig";

export const mergeInitsConfig = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<InitsConfig>): Inits => {
	const currentDefaultDirGenConfig = defaultDirConfig || {};
	const currentDirConfig = dirConfig || {};
	const currentRootGenConfig = rootConfig || {};

	return merge(
		currentDefaultDirGenConfig,
		currentDirConfig,
		currentRootGenConfig,
	);
};
