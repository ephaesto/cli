import { removeLine } from "../../prompts/removeLine";

export const clearQuestions = (args: string[], sanitizeArgs: any): void => {
    const argsValidCount = args.filter(args => args !== '_').length;
    const sanitizeArgsCount = Object.values(sanitizeArgs).length;
    removeLine(sanitizeArgsCount - argsValidCount)
}