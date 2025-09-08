import { expect } from "vitest";

const escapeAnsi = (value: string): string =>
	value.replace(/\u001b/g, "\\u001b").replace(/\n/g, "\\n\n");

function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function cleanAnsi(input: string, expected?: string | RegExp): string {
	const ansiRegex = /\u001b\[[0-9;?]*[A-Za-z]/g;

	if (!expected) {
		return input.replace(ansiRegex, "");
	}
	const expectedStr =
		expected instanceof RegExp ? expected.source : expected.toString();

	const allowedAnsi = Array.from(expectedStr.matchAll(ansiRegex), (m) => m[0]);

	return input.replace(ansiRegex, (match) => {
		return allowedAnsi.includes(match) ? match : "";
	});
}
export function extractLines(
	allStdout: string[],
	expected: string | RegExp,
): { lines: string[]; cleaned: string[] } {
	const lines: string[] = [];
	const cleaned: string[] = [];

	allStdout.forEach((stdout) => {
		const cleanedLine = cleanAnsi(stdout, expected);
		const pattern =
			expected instanceof RegExp
				? new RegExp(`\\n.*(${expected.source}).*\\n`, expected.flags)
				: new RegExp(`\\n.*(${escapeRegex(expected)}).*\\n`, "g");
		cleaned.push(cleanedLine);
		lines.push(
			...Array.from(cleanedLine.matchAll(pattern), (m) => m[1].trim()),
		);
	});

	return {
		lines,
		cleaned,
	};
}

export function setupStdoutMatchers() {
	expect.extend({
		toContainLine(allStdout: string[], expected: string | RegExp) {
			const { lines, cleaned } = extractLines(allStdout, expected);
			const pass = lines.length > 0;

			return {
				pass,
				message: () => {
					if (pass) {
						return `✅ Found line: "${expected}"`;
					}

					return [
						`❌ Expected line not found:`,
						`-> ${expected}\n-> ${escapeAnsi(expected.toString())}`,
						"",
						...cleaned.flatMap((cleanedValue) => [cleanedValue, ""]),
						"",
						...cleaned.flatMap((cleanedValue) => [
							escapeAnsi(cleanedValue),
							"",
						]),
					].join("\n");
				},
			};
		},

		toContainLinesInOrder(allStdout: string[], expected: (string | RegExp)[]) {
			const cleaned: string[] = [];
			const allLines: string[][] = [];

			allStdout.forEach((stdout) => {
				const innerCleaned = cleanAnsi(
					stdout,
					expected.map((e) => (e instanceof RegExp ? e.source : e)).join(" "),
				);
				cleaned.push(innerCleaned);
				allLines.push(
					Array.from(innerCleaned.matchAll(/\n([^\n]+)\n/g), (m) =>
						m[1].trim(),
					),
				);
			});

			let currentIndex = 0;
			let failedMatcher: string | undefined;

			const allPass: boolean[] = allLines.map((allLine) => {
				return expected.every((matcher) => {
					const matchIndex = allLine.findIndex((line, i) => {
						if (i < currentIndex) return false;
						return matcher instanceof RegExp
							? matcher.test(line)
							: line === matcher;
					});
					if (matchIndex >= currentIndex) {
						currentIndex = matchIndex + 1;
						return true;
					}
					failedMatcher = matcher.toString();
					return false;
				});
			});

			const pass = allPass.includes(true);

			return {
				pass,
				message: () => {
					if (pass) {
						return `✅ Lines matched in correct order`;
					}

					return [
						`❌ Lines not found in expected order.`,
						`→ Failed at: ${failedMatcher}`,
						`→ Expected sequence: ${expected.map((e) => e.toString()).join(" → ")}`,
						`→ Actual lines: ${allLines.join(" | ")}`,
						"",
						...cleaned.flatMap((cleanedValue) => [cleanedValue, ""]),
						"",
						...cleaned.flatMap((cleanedValue) => [
							escapeAnsi(cleanedValue),
							"",
						]),
					].join("\n");
				},
			};
		},
	});
}
