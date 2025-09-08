import chalk from "chalk";
import { describe, expect, it } from "vitest";
import { highlightText } from "./highlightText";

describe("highlightText", () => {
	it("highlights a single word in the text", () => {
		const result = highlightText("The sky is blue", "blue");
		expect(result).toBe(`The sky is ${chalk.bold("blue")}`);
	});

	it("highlights multiple occurrences of the word", () => {
		const result = highlightText("Blue is blue", "blue");
		expect(result).toBe(`${chalk.bold("Blue")} is ${chalk.bold("blue")}`);
	});

	it("is case-insensitive", () => {
		const result = highlightText("The Sky Is BLUE", "blue");
		expect(result).toBe(`The Sky Is ${chalk.bold("BLUE")}`);
	});

	it("returns original text if word is not found", () => {
		const result = highlightText("The sky is blue", "green");
		expect(result).toBe("The sky is blue");
	});

	it("returns original text if word is empty", () => {
		const result = highlightText("The sky is blue", "");
		expect(result).toBe("The sky is blue");
	});

	it("handles special characters in the word", () => {
		const result = highlightText("Price is 100€", "100€");
		expect(result).toBe(`Price is ${chalk.bold("100€")}`);
	});
});
