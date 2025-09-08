import { describe, expect, it } from "vitest";
import { renderCommand } from "~/src/test/renderCommand";
import { userEvent } from "../test/userEvent";
import { searchGenerator } from "./searchGenerator";

const generatorList = [
	{ name: "api", description: "RESTful API generator" },
	{ name: "cli", description: "Command-line tool generator" },
	{ name: "web", description: "Frontend web app generator" },
];

describe("searchGenerator", () => {
	it("should display the generator prompt message", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await renderCommand({
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					await searchGenerator({
						message: "Choose a generator",
						generatorList,
						processTerm,
					});
				});
			},
		});

		// Assert
		expect(stdout).toContainLine("Choose a generator");
		expect(exitCode).toBe(990);
	});

	it("should search and select 'cli' generator by full name", async () => {
		// Arrange
		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGenerator({
						message: "Choose a generator",
						generatorList,
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.type("cli");
		user.pressEnter();
		user.waitWrite("Selected: cli");
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("✦ You use generator cli");
		expect(stdout).toContainLine("Selected: cli");
		expect(exitCode).toBe(0);
	});

	it("should search and select 'cli' generator by partial input", async () => {
		// Arrange
		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGenerator({
						message: "Choose a generator",
						generatorList,
						processTerm,
					});
					processTerm.stdout.write(`Search: ${selected}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.type("cli");
		user.pressEnter();
		user.waitWrite("Selected: cli");
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("You use generator cli");
		expect(stdout).toContainLine("Search: cli");
		expect(exitCode).toBe(0);
	});

	it("should select default generator when pressing enter immediately", async () => {
		// Arrange
		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGenerator({
						message: "Choose a generator",
						generatorList,
						processTerm,
					});
					processTerm.stdout.write(`Search: ${selected}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.pressEnter();
		user.waitWrite("Search: api");
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("You use generator api");
		expect(stdout).toContainLine("Search: api");
		expect(exitCode).toBe(0);
	});

	it("should select 'web' generator using arrow navigation", async () => {
		// Arrange
		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGenerator({
						message: "Choose a generator",
						generatorList,
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.arrowDown();
		user.arrowDown();
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("You use generator web");
		expect(stdout).toContainLine("Selected: web");
		expect(exitCode).toBe(0);
	});
});
