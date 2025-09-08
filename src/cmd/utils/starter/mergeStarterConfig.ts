import mergeWith from "lodash.mergewith";
import {
	OTHER_FILTER,
	OTHER_GENERATOR,
	OTHER_IN,
	OTHER_QUESTION,
	OTHER_STARTER,
} from "~/src/const/starters";
import type { Starter } from "~/src/entities/Starter";
import type { FindConfig } from "~/src/path/findConfig";
import { mergeObject } from "./mergeObject";

export const mergeStarterConfig = ({
	dirConfig,
	defaultDirConfig,
	rootConfig,
}: FindConfig<Record<string, Starter>>): Record<string, Starter> => {
	const defaultDirGenConfig = defaultDirConfig || {};
	const dirGenConfig = dirConfig || {};
	const rootGenConfig = rootConfig || {};

	const customize = (objValue, srcValue) => {
		if (
			objValue &&
			typeof objValue === "object" &&
			srcValue &&
			typeof srcValue === "object"
		) {
			if (
				mergeObject({
					key: "generator",
					arrayKey: OTHER_GENERATOR,
					objValue,
					srcValue,
				})
			) {
				return;
			}
			if (mergeObject({ key: "in", arrayKey: OTHER_IN, objValue, srcValue })) {
				return;
			}
			if (
				mergeObject({
					key: "question",
					arrayKey: OTHER_QUESTION,
					objValue,
					srcValue,
				})
			) {
				return;
			}
			if (
				mergeObject({
					key: "keyFilter",
					arrayKey: OTHER_FILTER,
					objValue,
					srcValue,
				})
			) {
				return;
			}
			if (
				mergeObject({
					key: "starterName",
					arrayKey: OTHER_STARTER,
					objValue,
					srcValue,
				})
			) {
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
