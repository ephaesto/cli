import { CmdConfig } from "../entities/CmdConfig";

export let globalConfig: CmdConfig;

export const setGlobalConfig = (newGlobalConfig: CmdConfig) => {
    globalConfig = {...newGlobalConfig}
}

export const getGlobalConfig = (): CmdConfig => {
   return {...globalConfig};
}