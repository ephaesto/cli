import { describe, expect, it } from "vitest";
import { renderCommand } from "~/src/test/renderCommand";
import { userEvent } from "~/src/test/userEvent";
import { findStarter } from "./findStarter";

describe("findStarter", () => {
	const globalProcessTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
	};

	it("should return starter directly if name is valid", async () => {
		// Arrange/Act
		const starters = {
			alpha: { name: "Alpha Starter" },
			beta: { name: "Beta Starter" },
		};

		// Assert
		const result = await findStarter({
			starters,
			starterName: "alpha",
			processTerm: globalProcessTerm,
		});
		expect(result).toEqual({ name: "Alpha Starter" });
	});

	it("should log warning and prompt if name is invalid", async () => {
		// Arrange
		const starters = {
			alpha: { name: "Alpha Starter" },
			beta: { name: "Beta Starter" },
		};

		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["starter"],
			setup: ({ program, processTerm }) => {
				program.command("starter").action(async () => {
					const selected = await findStarter({
						starters,
						starterName: "gamma",
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected["name"]}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.type("beta");
		user.pressEnter();
		user.waitWrite("Selected: Beta Starter");
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("⚠ Starter name gamma isn't in the list");
		expect(stdout).toContainLine("Please choose a name of starter list beta");
		expect(stdout).toContainLine("Selected: Beta Starter");
		expect(exitCode).toBe(0);
	});

	it("should prompt when no name is provided", async () => {
		// Arrange
		const starters = {
			alpha: { name: "Alpha Starter" },
			beta: { name: "Beta Starter" },
		};

		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["starter"],
			setup: ({ program, processTerm }) => {
				program.command("starter").action(async () => {
					const selected = await findStarter({ starters, processTerm });
					processTerm.stdout.write(`Selected: ${selected["name"]}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.arrowDown();
		user.pressEnter();
		user.waitWrite("Selected: Beta Starter");
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("Please choose a name of starter list");
		expect(stdout).toContainLine("Selected: Beta Starter");
		expect(exitCode).toBe(0);
	});
});
