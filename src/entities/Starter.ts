import type { GeneratorsConfig } from "./Generators";

export interface CmdPlopParams {
	typeGen: string;
	generator: string;
	params?: Record<string, string>;
	out?: string;
	force?: boolean;
}

export interface FilePlopParams {
	typeGen: string;
	in: string;
	out?: string;
	force?: boolean;
	deep?: boolean;
	ignoreDest?: boolean;
}

export interface StarterLink {
	starterName: string;
	nameSpace: string;
}

export interface MultiChoice {
	question: string;
	name: string;
	values:
		| Record<string, CmdPlopParams | FilePlopParams | StarterLink>
		| Record<string, string>
		| Filter<
				| Record<string, CmdPlopParams | FilePlopParams | StarterLink>
				| Record<string, string>
		  >;
}

export interface Filter<T = unknown> {
	keyFilter: string;
	defaultFilter: string;
	values: Record<string, T>;
}
export type StarterParams =
	| CmdPlopParams
	| FilePlopParams
	| MultiChoice
	| StarterLink
	| Filter<CmdPlopParams | FilePlopParams | StarterLink>;

export type Starter = Record<`step${number}`, StarterParams>;

export interface StarterConfig extends Record<string, unknown> {
	generators: GeneratorsConfig;
	starters: Record<string, Starter>;
}
