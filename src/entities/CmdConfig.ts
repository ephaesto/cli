import type { CustomActionFunction, NodePlopAPI } from "node-plop";
import type { CmdFn } from "./CmdFn";

export interface CommandParams {
	plop?: string;
	config?: string;
}
type CommandCmdConfig = {
	cmdFn: CmdFn;
} & CommandParams;

export type RecordCamelCase<T extends string | number | symbol, U> = Record<
	T,
	U
>;
export interface FileType {
	read: (path: string) => RecordCamelCase<string, string>;
	write: (path: string, data: RecordCamelCase<string, string>) => void;
}

type FindFile = Record<string, Record<string, FileType>>;

export interface CmdConfig {
	name?: string;
	description?: string;
	cliFolder?: string;
	rootKey?: string;
	dirnamesFile?: string;
	version?: string;
	command?: Record<string, CommandCmdConfig>;
	helpers?: Record<string, Handlebars.HelperDelegate>;
	partials?: Record<string, string>;
	actions?: Record<string, CustomActionFunction>;
	prompts?: Record<string, Parameters<NodePlopAPI["setPrompt"]>[1]>;
	loads?: string[];
	configFile?: string;
	configFileExt?: string;
	configFileType?: string;
	genFileExt?: string;
	genFileType?: string;
	findFile?: FindFile;
}
