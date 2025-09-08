import type { Extracts } from "~/src/entities/Extracts";

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
