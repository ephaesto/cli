import mergeWith from "lodash.mergewith";
import type { Starter } from "../../../entities/Starter";
import type { FindConfig } from "../../../path/findConfig";

export const mergeStarterConfig = ({
	dirConfig,
	defaultDirConfig,
	rootConfig,
}: FindConfig<Record<string, Starter>>): Record<string, Starter> => {
	const defaultDirGenConfig = defaultDirConfig || {};
	const dirGenConfig = dirConfig || {};
	const rootGenConfig = rootConfig || {};
	const replaceObject = (
		oldObject: Record<string, unknown>,
		newValues: Record<string, unknown>,
	) => {
		Object.keys(oldObject).forEach((key) => {
			delete oldObject[key];
		});
		Object.entries(newValues).forEach(([key, value]) => {
			oldObject[key] = value;
		});
	};

	const customize = (objValue, srcValue) => {
		if (typeof objValue === "boolean") {
			console.log(objValue);
			console.log(srcValue);
		}
		if (
			objValue &&
			typeof objValue === "object" &&
			srcValue &&
			typeof srcValue === "object"
		) {
			if (
				(!objValue.generator && srcValue.generator) ||
				(!srcValue.generator && objValue.generator)
			) {
				replaceObject(objValue, srcValue);
				return;
			}
			if ((!objValue.in && srcValue.in) || (!srcValue.in && objValue.in)) {
				replaceObject(objValue, srcValue);
				return;
			}
			if (
				(!objValue.question && srcValue.question) ||
				(!srcValue.question && objValue.question)
			) {
				replaceObject(objValue, srcValue);
				return;
			}

			if (
				(!objValue.keyFilter && srcValue.keyFilter) ||
				(!srcValue.keyFilter && objValue.keyFilter)
			) {
				replaceObject(objValue, srcValue);
				return;
			}

			if (
				(!objValue.starterName && srcValue.starterName) ||
				(!srcValue.starterName && objValue.starterName)
			) {
				replaceObject(objValue, srcValue);
				return;
			}
		}
	};

	return mergeWith(
		mergeWith(defaultDirGenConfig, dirGenConfig, customize),
		rootGenConfig,
		customize,
	);
};
