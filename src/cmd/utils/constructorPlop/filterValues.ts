import type { Filter } from "~/src/entities/Starter";

export const filterValues = <T>(
	filter: Filter<T>,
	args: Record<string, string>,
): T => {
	if (args[filter.keyFilter]) {
		return filter.values[args[filter.keyFilter]];
	}
	return filter.values[filter.defaultFilter];
};
