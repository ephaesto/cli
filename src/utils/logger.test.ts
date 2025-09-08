import chalk from "chalk";
import { describe, expect, it } from "vitest";
import { renderCommand } from "~/src/test/renderCommand";
import { logError, logger } from "./logger";

describe("CLI logger integration", () => {
	it("should print a simple log message", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await renderCommand({
			argv: ["hello"],
			setup: ({ program, processTerm }) => {
				program.command("hello").action(() => {
					logger({ processTerm, args: ["Hello world"] });
					processTerm.exit(0);
				});
			},
		});

		// Assert
		expect(stdout).toContainLine("Hello world");
		expect(exitCode).toBe(0);
	});

	it("should format and print an object", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await renderCommand({
			argv: ["json"],
			setup: ({ program, processTerm }) => {
				program.command("json").action(() => {
					logger({ processTerm, args: [{ name: "Charles", active: true }] });
					processTerm.exit(0);
				});
			},
		});

		// Assert
		expect(stdout).toContainLine('"name": "Charles"');
		expect(stdout).toContainLine('"active": true');
		expect(exitCode).toBe(0);
	});

	it("should print an error with chalk formatting", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await renderCommand({
			argv: ["fail"],
			setup: ({ program, processTerm }) => {
				program.command("fail").action(() => {
					logError({ processTerm, error: new Error("Something went wrong") });
					processTerm.exit(0);
				});
			},
		});

		// Assert
		expect(stdout).toContainLine(
			`${chalk.bgRed("Error")} ${chalk.red("Something went wrong")}`,
		);
		expect(exitCode).toBe(0);
	});
});
