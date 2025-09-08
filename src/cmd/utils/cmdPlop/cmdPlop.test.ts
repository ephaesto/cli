import chalk from "chalk";
import { describe, expect, it, vi } from "vitest";
import { formatError } from "~/src/test/formatError";
import { renderCommand } from "~/src/test/renderCommand";
import { cmdPlop } from "./cmdPlop";

const MockRunActions = vi.fn();
const MockRunPrompts = vi.fn();
const MockPrompts = [
	{ name: "name", type: "input", message: "Your name?" },
	{ name: "age", type: "input", message: "Your age?" },
];

vi.mock("node-plop", () => {
	return {
		default: () => ({
			getGeneratorList: () => [
				{ name: "api", description: "RESTful API generator" },
				{ name: "cli", description: "Command-line tool generator" },
				{ name: "web", description: "Frontend web app generator" },
			],
			getGenerator: () => ({
				prompts: MockPrompts,
				runPrompts: MockRunPrompts,
				runActions: MockRunActions,
			}),
		}),
	};
});

describe("cmdPlop", () => {
	it("should prompt for generator and select 'cli' via full input", async () => {
		MockRunPrompts.mockResolvedValue({ name: "Alice", age: "30" });
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const { stdout, exitCode } = await renderCommand({
			options: { delay: 200 },
			argv: ["cmd"],
			setup: async ({ program, user }) => {
				program.command("cmd").action(async () => {
					try {
						const result = cmdPlop({
							args: ["unknown", { name: "Alice", age: "30" }],
							configPath: "./plopfile.js",
						});
						await user.type("cli");
						await user.pressEnter();
						user.end();
						await result;
						process.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						process.stderr.write(`${message}\n`);
						process.exit(1);
					}
				});
			},
		});

		expect(stdout).toContainLine("Please choose a valid generator");
		expect(stdout).toContainLine("Please choose a valid generator cli");
		expect(stdout).toContainLine("You use generator cli");
		expect(exitCode).toBe(0);
	});

	it("should select default generator when pressing enter immediately", async () => {
		MockRunPrompts.mockResolvedValue({ name: "Alice", age: "30" });
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const { stdout, exitCode } = await renderCommand({
			argv: ["cmd"],
			setup: async ({ program, user }) => {
				program.command("cmd").action(async () => {
					try {
						const result = cmdPlop({
							args: ["", { name: "Alice", age: "30" }],
							configPath: "./plopfile.js",
						});
						await user.pressEnter();
						user.end();
						await result;
						process.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						process.stderr.write(`${message}\n`);
						process.exit(1);
					}
				});
			},
		});

		expect(stdout).toContainLine("Please choose a generator");
		expect(stdout).toContainLine("You use generator api");
		expect(exitCode).toBe(0);
	});

	it("should run generator and log changes and failures", async () => {
		MockRunPrompts.mockResolvedValue({ name: "Alice", age: "30" });
		MockRunActions.mockReturnValue({
			changes: [{ type: "add", path: "src/index.ts" }],
			failures: [{ type: "error", error: "Oops!" }],
		});

		const { stdout, exitCode } = await renderCommand({
			argv: ["cmd"],
			setup: ({ program }) => {
				program.command("cmd").action(async () => {
					try {
						await cmdPlop({
							args: ["cli", { name: "Alice", age: "30" }],
							configPath: "./plopfile.js",
						});
						process.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						process.stderr.write(`${message}\n`);
						process.exit(1);
					}
				});
			},
		});

		expect(stdout).toContainLine("You use generator cli");
		expect(stdout).toContainLine(
			`${chalk.green("✔")} ${chalk.blueBright.bold.italic(`[add]`)} src/index.ts`,
		);
		expect(stdout).toContainLine(
			`${chalk.red("✖")} ${chalk.blueBright.bold.italic(`[error]`)} Oops!`,
		);
		expect(exitCode).toBe(0);
	});
});
