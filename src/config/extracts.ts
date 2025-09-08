import type { Extracts } from "../entities/Extract";

let extracts: Partial<Extracts> = {};

export const setExtracts = (newExtracts: Partial<Extracts>) => {
	extracts = { ...newExtracts };
};

export const getExtracts = (): Partial<Extracts> => {
	return { ...extracts };
};

export const clearExtracts = () => {
	extracts = {};
};
