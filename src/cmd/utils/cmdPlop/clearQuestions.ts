import { SKIP_PARAMS_VALUE } from "~/src/const/skippedParams";
import { removeLine } from "~/src/prompts/removeLine";

export const clearQuestions = (args: string[], sanitizeArgs: any): void => {
	const argsValidCount = args.filter(
		(args) => args !== SKIP_PARAMS_VALUE,
	).length;
	const sanitizeArgsCount = Object.values(sanitizeArgs).length;
	removeLine(sanitizeArgsCount - argsValidCount);
};
