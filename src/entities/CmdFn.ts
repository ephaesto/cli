import { Command } from "commander";
import { CommandParams } from "./CmdConfig";

interface CmdFnParams {
    program: Command;
    name: string
    config: CommandParams;
    dirname: string;
    defaultDirname: string;
    stopSpinner: () => void ;
}

export type CmdFn = (params: CmdFnParams) => void