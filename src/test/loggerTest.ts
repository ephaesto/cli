export const loggerTest = (stoutWrite: any, ...args: (string | object)[]) => {
	const formatted = args
		.map((arg) => {
			if (typeof arg === "object") {
				return JSON.stringify(arg, null, 2);
			}
			return arg;
		})
		.join(" ");
	const clearFormatted = formatted
		// biome-ignore lint/suspicious/noControlCharactersInRegex: <test utils>>
		.replace(/\u001b/g, "\\u001b")
		.replace(/\n/g, "\\n");
	stoutWrite(`${clearFormatted}\n`);
};
