import { CustomActionFunction, NodePlopAPI } from "node-plop";
import { CmdFn } from "./CmdFn";

export interface CommandParams {
    plop?: string,
    config?: string;
}
type CommandCmdConfig = {
    cmdFn:CmdFn,
} & CommandParams

export interface CmdConfig {
    name?: string,
    configFile?: string,
    description?:string,
    cliFolder?:string,
    rootKey?:string,
    dirnamesKey?:string,
    version?:string,
    command?: Record<string, CommandCmdConfig>
    helpers?: Record<string, Handlebars.HelperDelegate>,
    partials?: Record<string, string>,
    actions?: Record<string, CustomActionFunction>,
    prompts?: Record<string, Parameters<NodePlopAPI['setPrompt']>[1]>,
    loads?: string[],
}
