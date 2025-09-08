import "vitest";

declare module "vitest" {
	// biome-ignore lint/correctness/noUnusedVariables: <type>
	interface Assertion<T = any> {
		toContainLine(expected: string | RegExp): void;
		toContainLinesInOrder(expected: (string | RegExp)[]): void;
	}
}
