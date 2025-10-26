import type { CmdConfig } from "~/src/entities/CmdConfig";

export let globalConfig: CmdConfig;

export const setGlobalConfig = (newGlobalConfig: Partial<CmdConfig>) => {
	globalConfig = { ...globalConfig, ...newGlobalConfig };
};

export const getGlobalConfig = (): CmdConfig => {
	return { ...globalConfig };
};

export const clearGlobalConfig = () => {
	globalConfig = {};
};
