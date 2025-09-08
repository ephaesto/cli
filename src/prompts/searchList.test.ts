import { describe, expect, it } from "vitest";
import { renderCommand } from "~/src/test/renderCommand";
import { searchList } from "./searchList";

describe("searchList", () => {
	it("should display the search prompt message", async () => {
		const options = {
			enableLogTerm: true,
		};
		const { stdout, exitCode } = await renderCommand({
			options,
			argv: ["search"],
			setup: ({ program }) => {
				program.command("search").action(async () => {
					await searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
					});
				});
			},
		});

		expect(stdout).toContainLine("Choose a fruit");
		expect(exitCode).toBe(990);
	});

	it("should display the search prompt message with search value", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["search"],
			setup: ({ program, user }) => {
				program.command("search").action(async () => {
					const selected = searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
					});
					await user.type("banana");
					await selected;
				});
			},
		});

		expect(stdout).toContainLine("Choose a fruit banana");
		expect(exitCode).toBe(990);
	});

	it("should display the selected prompt message", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["search"],
			setup: ({ program, user }) => {
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
		});
		expect(stdout).toContainLine("You use type apple");
		expect(exitCode).toBe(990);
	});

	it("should simulate select second element", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["search"],
			setup: ({ program, user }) => {
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
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("Select: banana");
		expect(exitCode).toBe(0);
	});

	it("should simulate search element by full name", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["search"],
			setup: ({ program, user }) => {
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
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("Search: banana");
		expect(exitCode).toBe(0);
	});

	it("should simulate search element by partial information", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["search"],
			setup: ({ program, user }) => {
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
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("Search: banana");
		expect(exitCode).toBe(0);
	});
});
