import type { ArrayKey } from "~/src/cmd/utils/starter/mergeObject";

export enum STARTER_TYPES {
	CMD_PLOP = "CmdPlop",
	FILE_PLOP = "FilePlop",
	STARTER = "Starter",
	MULTI_CHOICE = "MultiChoice",
	FILTER = "Filter",
	UNKNOWN = "UNKNOWN",
}

export const OTHER_GENERATOR: ArrayKey = [
	"in",
	"question",
	"keyFilter",
	"starterName",
];

export const OTHER_IN: ArrayKey = [
	"generator",
	"question",
	"keyFilter",
	"starterName",
];

export const OTHER_QUESTION: ArrayKey = [
	"generator",
	"in",
	"keyFilter",
	"starterName",
];

export const OTHER_FILTER: ArrayKey = [
	"generator",
	"in",
	"question",
	"starterName",
];

export const OTHER_STARTER: ArrayKey = [
	"generator",
	"in",
	"question",
	"keyFilter",
];
