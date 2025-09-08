import { describe, expect, test } from "vitest";
import { renderCommand } from "../test/renderCommand";
import { searchGenerator } from "./searchGenerator";

const generatorList = [
	{ name: "api", description: "RESTful API generator" },
	{ name: "cli", description: "Command-line tool generator" },
	{ name: "web", description: "Frontend web app generator" },
];

describe("searchGenerator", () => {
	test("should display the generator prompt message", async () => {
		const { stdout, exitCode } = await renderCommand(
			["generate"],
			(program) => {
				program.command("generate").action(async () => {
					await searchGenerator({
						message: "Choose a generator",
						generatorList,
					});
				});
			},
		);

		expect(stdout).toContain("Choose a generator");
		expect(exitCode).toBe(0);
	});

	test("should search and select 'cli' generator by full name", async () => {
		const { stdout, exitCode } = await renderCommand(
			["generate"],
			(program, user) => {
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
				});
			},
		);

		expect(stdout).toContain("You use generator");
		expect(stdout).toContain("Selected: cli");
		expect(exitCode).toBe(0);
	});

	test("should search and select 'cli' generator by partial input", async () => {
		const { stdout, exitCode } = await renderCommand(
			["generate"],
			(program, user) => {
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
				});
			},
		);

		expect(stdout).toContain("You use generator");
		expect(stdout).toContain("Search: cli");
		expect(exitCode).toBe(0);
	});

	test("should select default generator when pressing enter immediately", async () => {
		const { stdout, exitCode } = await renderCommand(
			["generate"],
			(program, user) => {
				program.command("generate").action(async () => {
					const selected = searchGenerator({
						message: "Choose a generator",
						generatorList,
					});

					await user.pressEnter();
					user.end();

					const result = await selected;
					process.stdout.write(`Search: ${result}\n`);
				});
			},
		);

		expect(stdout).toContain("You use generator");
		expect(stdout).toContain("Search: api");
		expect(exitCode).toBe(0);
	});

	test("should select 'web' generator using arrow navigation", async () => {
		const { stdout, exitCode } = await renderCommand(
			["generate"],
			(program, user) => {
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
				});
			},
		);

		expect(stdout).toContain("You use generator");
		expect(stdout).toContain("Selected: web");
		expect(exitCode).toBe(0);
	});
});
