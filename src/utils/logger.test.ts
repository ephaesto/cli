import { describe, expect, test } from "vitest";
import { ANSI_BG_RED, ANSI_RED } from "../test/const/chalkColor";
import { renderCommand } from "../test/renderCommand";
import { logError, logger } from "./logger";

describe("CLI logger integration", () => {
	test("should print a simple log message", async () => {
		const { stdout, exitCode } = await renderCommand(["hello"], (program) => {
			program.command("hello").action(() => {
				logger("Hello world");
			});
		});

		expect(stdout).toContain("Hello world");
		expect(exitCode).toBe(0);
	});

	test("should format and print an object", async () => {
		const { stdout, exitCode } = await renderCommand(["json"], (program) => {
			program.command("json").action(() => {
				logger({ name: "Charles", active: true });
			});
		});

		expect(stdout).toContain('"name": "Charles"');
		expect(stdout).toContain('"active": true');
		expect(exitCode).toBe(0);
	});

	test("should print an error with chalk formatting", async () => {
		const { stdout, exitCode } = await renderCommand(["fail"], (program) => {
			program.command("fail").action(() => {
				logError(new Error("Something went wrong"));
			});
		});

		expect(stdout).toContain("Something went wrong");

		expect(stdout.includes(ANSI_BG_RED)).toBe(true);
		expect(stdout.includes(ANSI_RED)).toBe(true);
		expect(exitCode).toBe(0);
	});
});
