import merge from "lodash.merge";
import type {
	Generators,
	GeneratorsConfig,
} from "../../../entities/Generators";
import type { FindConfig } from "../../../path/findConfig";

export const mergeGeneratorConfig = ({
	dirConfig,
	defaultDirConfig,
	rootConfig,
}: FindConfig<GeneratorsConfig>): GeneratorsConfig => {
	const oneIsMulti =
		dirConfig?.subGenConf ||
		defaultDirConfig?.subGenConf ||
		rootConfig?.subGenConf;
	let dirGenConfig = dirConfig || {};
	let defaultDirGenConfig = defaultDirConfig || {};
	let rootGenConfig = rootConfig || {};

	if (
		oneIsMulti &&
		!dirGenConfig.subGenConf &&
		Object.values(dirGenConfig).length
	) {
		dirGenConfig = { subGenConf: true, default: dirGenConfig as Generators };
	}
	if (
		oneIsMulti &&
		!defaultDirGenConfig.subGenConf &&
		Object.values(defaultDirGenConfig).length
	) {
		defaultDirGenConfig = {
			subGenConf: true,
			default: defaultDirGenConfig as Generators,
		};
	}
	if (
		oneIsMulti &&
		!rootGenConfig.subGenConf &&
		Object.values(rootGenConfig).length
	) {
		rootGenConfig = { subGenConf: true, default: rootGenConfig as Generators };
	}

	return merge(merge(defaultDirGenConfig, dirGenConfig), rootGenConfig);
};
