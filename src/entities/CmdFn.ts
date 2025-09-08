import type { Command } from "commander";
import type { CommandParams } from "./CmdConfig";

interface CmdFnParams {
	program: Command;
	name: string;
	config: CommandParams;
	dir: string;
	defaultDir: string;
	stopSpinner: () => void;
}

export type CmdFn = (params: CmdFnParams) => void;
