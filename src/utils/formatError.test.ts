import { describe, expect, test } from "vitest";
import { formatError } from "./formatError";

describe("formatError", () => {
	test("should return the same Error instance if input is an Error", () => {
		const original = new Error("Original error");
		const result = formatError(original);

		expect(result).toBe(original);
		expect(result.message).toBe("Original error");
	});

	test("should convert a string to an Error", () => {
		const result = formatError("Something went wrong");

		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe("Something went wrong");
	});

	test('should return "unknown" error for non-string, non-Error input', () => {
		const result = formatError({ unexpected: true });

		expect(result).toBeInstanceOf(Error);
		expect(result.message).toBe("unknown");
	});
});
