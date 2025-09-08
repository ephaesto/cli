import { describe, expect, test } from "vitest";
import { renderCommand } from "../test/renderCommand";
import { searchList } from "./searchList";

describe("searchList", () => {
	test("should display the search prompt message", async () => {
		const { stdout, exitCode } = await renderCommand(["search"], (program) => {
			program.command("search").action(async () => {
				await searchList({
					message: "Choose a fruit",
					list: ["apple", "banana", "cherry"],
				});
			});
		});

		expect(stdout).toContain("Choose a fruit");
		expect(exitCode).toBe(0);
	});

	test("should display the search prompt message with search value", async () => {
		const { stdout, exitCode } = await renderCommand(
			["search"],
			(program, user) => {
				program.command("search").action(async () => {
					const selected = searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
					});
					await user.type("banana");
					await selected;
				});
			},
		);
		expect(stdout).toContain("Choose a fruit");
		expect(stdout).toContain("banana");
		expect(exitCode).toBe(0);
	});

	test("should display the selected prompt message", async () => {
		const { stdout, exitCode } = await renderCommand(
			["search"],
			(program, user) => {
				program.command("search").action(async () => {
					const selected = searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
					});
					await user.pressEnter();
					user.end();
					await selected;
				});
			},
		);
		expect(stdout).toContain("You use type");
		expect(stdout).toContain("apple");
		expect(exitCode).toBe(0);
	});

	test("should simulate select second element", async () => {
		const { stdout, exitCode } = await renderCommand(
			["search"],
			(program, user) => {
				program.command("search").action(async () => {
					const selected = searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
					});
					await user.arrowDown();
					await user.pressEnter();
					user.end();
					const result = await selected;

					process.stdout.write(`Select: ${result}\n`);
				});
			},
		);

		expect(stdout).toContain("Select: banana");
		expect(exitCode).toBe(0);
	});

	test("should simulate search element by full name", async () => {
		const { stdout, exitCode } = await renderCommand(
			["search"],
			(program, user) => {
				program.command("search").action(async () => {
					const selected = searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
					});

					await user.type("banana");
					await user.pressEnter();
					user.end();
					const result = await selected;

					process.stdout.write(`Search: ${result}\n`);
				});
			},
		);

		expect(stdout).toContain("Search: banana");
		expect(exitCode).toBe(0);
	});

	test("should simulate search element by partial information", async () => {
		const { stdout, exitCode } = await renderCommand(
			["search"],
			(program, user) => {
				program.command("search").action(async () => {
					const selected = searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
					});

					await user.type("a");
					await user.arrowDown();
					await user.pressEnter();
					user.end();
					const result = await selected;

					process.stdout.write(`Search: ${result}\n`);
				});
			},
		);

		expect(stdout).toContain("Search: banana");
		expect(exitCode).toBe(0);
	});
});
