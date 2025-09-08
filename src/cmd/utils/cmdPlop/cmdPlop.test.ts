import chalk from "chalk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderCommand } from "~/src/test/renderCommand";
import { userEvent } from "~/src/test/userEvent";
import { formatError } from "~/src/test/utils/formatError";
import { cmdPlop } from "./cmdPlop";

const MockRunActions = vi.fn();
const MockRunPrompts = vi.fn();
const MockPrompts = [
	{ name: "name", type: "input", message: "Your name?" },
	{ name: "age", type: "input", message: "Your age?" },
];
const MockSetDefaultInclude = vi.fn();

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
			setDefaultInclude: (params: any) => MockSetDefaultInclude(params),
		}),
	};
});

describe("cmdPlop", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetModules();
	});
	it("should prompt for generator and select 'cli' via full input", async () => {
		// Arrange
		MockRunPrompts.mockResolvedValue({ name: "Alice", age: "30" });
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["cmd"],
			setup: async ({ program, processTerm }) => {
				program.command("cmd").action(async () => {
					try {
						await cmdPlop({
							args: ["unknown", { name: "Alice", age: "30" }],
							configPath: "./plopfile.js",
							processTerm,
						});
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Act
		user.type("cli");
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("Please choose a valid generator");
		expect(stdout).toContainLine("Please choose a valid generator cli");
		expect(stdout).toContainLine("You use generator cli");
		expect(exitCode).toBe(0);
	});

	it("should select default generator when pressing enter immediately", async () => {
		// Arrange
		MockRunPrompts.mockResolvedValue({ name: "Alice", age: "30" });
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["cmd"],
			setup: async ({ program, processTerm }) => {
				program.command("cmd").action(async () => {
					try {
						await cmdPlop({
							args: ["", { name: "Alice", age: "30" }],
							configPath: "./plopfile.js",
							processTerm,
						});
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Act
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("Please choose a generator");
		expect(stdout).toContainLine("You use generator api");
		expect(exitCode).toBe(0);
	});

	it("should run generator and log changes and failures", async () => {
		// Arrange/ Act
		MockRunPrompts.mockResolvedValue({ name: "Alice", age: "30" });
		MockRunActions.mockReturnValue({
			changes: [{ type: "add", path: "src/index.ts" }],
			failures: [{ type: "error", error: "Oops!" }],
		});

		const { stdout, exitCode } = await renderCommand({
			argv: ["cmd"],
			setup: ({ program, processTerm }) => {
				program.command("cmd").action(async () => {
					try {
						await cmdPlop({
							args: ["cli", { name: "Alice", age: "30" }],
							configPath: "./plopfile.js",
							processTerm,
						});
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Assert
		expect(stdout).toContainLine("You use generator cli");
		expect(stdout).toContainLine(
			`${chalk.green("✔")} ${chalk.blueBright.bold.italic(`[add]`)} src/index.ts`,
		);
		expect(stdout).toContainLine(
			`${chalk.red("✖")} ${chalk.blueBright.bold.italic(`[error]`)} Oops!`,
		);
		expect(exitCode).toBe(0);
	});

	it("should skip prompts when ignorePrompts is true and use provided args directly", async () => {
		// Arrange/Acts
		MockRunPrompts.mockResolvedValue({});
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const providedArgs = { name: "Bob", age: "42" };

		const { stdout, exitCode } = await renderCommand({
			argv: ["cmd"],
			setup: ({ program, processTerm }) => {
				program.command("cmd").action(async () => {
					try {
						await cmdPlop({
							args: ["cli", providedArgs],
							configPath: "./plopfile.js",
							processTerm,
							ignorePrompts: true,
						});
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Assert
		expect(stdout).toContainLine("You use generator cli");
		expect(MockRunPrompts).not.toHaveBeenCalled(); // ✅ pas de prompts
		expect(MockRunActions).toHaveBeenCalledWith(providedArgs); // ✅ args directs
		expect(exitCode).toBe(0);
	});
});
