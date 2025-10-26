import type { Generators } from "~/src/entities/Generators";

let generators: Partial<Generators> = {};

export const setGenerators = (newGenerators: Partial<Generators>) => {
	generators = { ...newGenerators };
};

export const getGenerators = (): Partial<Generators> => {
	return { ...generators };
};

export const clearGenerators = () => {
	generators = {};
};
