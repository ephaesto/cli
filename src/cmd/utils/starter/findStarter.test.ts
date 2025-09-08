import { describe, expect, it } from "vitest";
import { renderCommand } from "~/src/test/renderCommand";
import { findStarter } from "./findStarter";

describe("findStarter", () => {
	it("should return starter directly if name is valid", async () => {
		const starters = {
			alpha: { name: "Alpha Starter" },
			beta: { name: "Beta Starter" },
		};

		const result = await findStarter(starters, "alpha");
		expect(result).toEqual({ name: "Alpha Starter" });
	});

	it("should log warning and prompt if name is invalid", async () => {
		const starters = {
			alpha: { name: "Alpha Starter" },
			beta: { name: "Beta Starter" },
		};

		const { stdout, exitCode } = await renderCommand({
			options: { delay: 200 },
			argv: ["starter"],
			setup: ({ program, user }) => {
				program.command("starter").action(async () => {
					const result = findStarter(starters, "gamma");
					await user.type("beta");
					await user.pressEnter();
					user.end();
					const selected = await result;
					process.stdout.write(`Selected: ${selected["name"]}\n`);
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("⚠ Starter name gamma isn't in the list");
		expect(stdout).toContainLine("Please choose a name of starter list beta");
		expect(stdout).toContainLine("Selected: Beta Starter");
		expect(exitCode).toBe(0);
	});

	it("should prompt when no name is provided", async () => {
		const starters = {
			alpha: { name: "Alpha Starter" },
			beta: { name: "Beta Starter" },
		};

		const { stdout, exitCode } = await renderCommand({
			argv: ["starter"],
			setup: ({ program, user }) => {
				program.command("starter").action(async () => {
					const result = findStarter(starters);
					await user.arrowDown();
					await user.pressEnter();
					user.end();
					const selected = await result;
					process.stdout.write(`Selected: ${selected["name"]}\n`);
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("Please choose a name of starter list");
		expect(stdout).toContainLine("Selected: Beta Starter");
		expect(exitCode).toBe(0);
	});
});
