import { expect } from "vitest";

expect.extend({
	toBeInTerm(received: string | null) {
		const isString = typeof received === "string";

		return {
			pass: isString,
			message: () =>
				isString
					? `✅ Found in term: "${received}"`
					: `❌ Expected value to be in term output`,
		};
	},
});
