import { describe, expect, it } from "vitest";
import { renderCommand } from "~/src/test/renderCommand";
import { searchGenerator } from "./searchGenerator";

const generatorList = [
	{ name: "api", description: "RESTful API generator" },
	{ name: "cli", description: "Command-line tool generator" },
	{ name: "web", description: "Frontend web app generator" },
];

describe("searchGenerator", () => {
	it("should display the generator prompt message", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["generate"],
			setup: ({ program }) => {
				program.command("generate").action(async () => {
					await searchGenerator({
						message: "Choose a generator",
						generatorList,
					});
				});
			},
		});

		expect(stdout).toContainLine("Choose a generator");
		expect(exitCode).toBe(990);
	});

	it("should search and select 'cli' generator by full name", async () => {
		const { stdout, exitCode } = await renderCommand({
			options: { delay: 200 },
			argv: ["generate"],
			setup: ({ program, user }) => {
				program.command("generate").action(async () => {
					const selected = searchGenerator({
						message: "Choose a generator",
						generatorList,
					});

					await user.type("cli");
					await user.pressEnter();
					user.end();

					const result = await selected;
					process.stdout.write(`Selected: ${result}\n`);
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("✦ You use generator cli");
		expect(stdout).toContainLine("Selected: cli");
		expect(exitCode).toBe(0);
	});

	it("should search and select 'cli' generator by partial input", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["generate"],
			setup: ({ program, user }) => {
				program.command("generate").action(async () => {
					const selected = searchGenerator({
						message: "Choose a generator",
						generatorList,
					});

					await user.type("c");
					await user.arrowDown();
					await user.pressEnter();
					user.end();

					const result = await selected;
					process.stdout.write(`Search: ${result}\n`);
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("You use generator cli");
		expect(stdout).toContainLine("Search: cli");
		expect(exitCode).toBe(0);
	});

	it("should select default generator when pressing enter immediately", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["generate"],
			setup: ({ program, user }) => {
				program.command("generate").action(async () => {
					const selected = searchGenerator({
						message: "Choose a generator",
						generatorList,
					});

					await user.pressEnter();
					user.end();

					const result = await selected;
					process.stdout.write(`Search: ${result}\n`);
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("You use generator api");
		expect(stdout).toContainLine("Search: api");
		expect(exitCode).toBe(0);
	});

	it("should select 'web' generator using arrow navigation", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["generate"],
			setup: ({ program, user }) => {
				program.command("generate").action(async () => {
					const selected = searchGenerator({
						message: "Choose a generator",
						generatorList,
					});

					await user.arrowDown();
					await user.arrowDown();
					await user.pressEnter();
					user.end();

					const result = await selected;
					process.stdout.write(`Selected: ${result}\n`);
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("You use generator web");
		expect(stdout).toContainLine("Selected: web");
		expect(exitCode).toBe(0);
	});
});
