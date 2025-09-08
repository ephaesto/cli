import chalk from "chalk";
import { describe, expect, it } from "vitest";
import { renderCommand } from "~/src/test/renderCommand";
import { logError, logger } from "./logger";

describe("CLI logger integration", () => {
	it("should print a simple log message", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["hello"],
			setup: ({ program }) => {
				program.command("hello").action(() => {
					logger("Hello world");
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("Hello world");
		expect(exitCode).toBe(0);
	});

	it("should format and print an object", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["json"],
			setup: ({ program }) => {
				program.command("json").action(() => {
					logger({ name: "Charles", active: true });
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine('"name": "Charles"');
		expect(stdout).toContainLine('"active": true');
		expect(exitCode).toBe(0);
	});

	it("should print an error with chalk formatting", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["fail"],
			setup: ({ program }) => {
				program.command("fail").action(() => {
					logError(new Error("Something went wrong"));
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine(
			`${chalk.bgRed("Error")} ${chalk.red("Something went wrong")}`,
		);
		expect(exitCode).toBe(0);
	});
});
