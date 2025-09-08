import { SKIP_PARAMS_VALUE } from "~/src/const/skippedParams";
import type { ProcessTerm } from "~/src/entities/ProcessTerm";
import { removeLine } from "~/src/prompts/removeLine";

export const clearQuestions = (
	processTerm: ProcessTerm,
	args: string[],
	sanitizeArgs: any,
): void => {
	const argsValidCount = args.filter(
		(args) => args !== SKIP_PARAMS_VALUE,
	).length;
	const sanitizeArgsCount = Object.values(sanitizeArgs).length;
	removeLine({ processTerm, nb: sanitizeArgsCount - argsValidCount });
};
