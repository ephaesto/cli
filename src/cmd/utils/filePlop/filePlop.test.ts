import chalk from "chalk";
import { describe, expect, it, vi } from "vitest";
import type { GenObject } from "~/src/entities/GenObject";
import * as pathModule from "~/src/path/pathConstructor";
import { formatError } from "~/src/test/formatError";
import { renderCommand } from "~/src/test/renderCommand";
import * as readJsonModule from "~/src/utils/readJson";
import { filePlop } from "./filePlop";

const MockRunActions = vi.fn();

vi.mock("node-plop", () => {
	return {
		default: () => ({
			getGenerator: () => ({ runActions: () => MockRunActions() }),
		}),
	};
});

const genObject: GenObject = {
	genName: "my-generator",
	genId: "001",
	genMeta: {},
	genDest: "./generated",
	foo: "bar",
};

describe("filePlop", () => {
	it("should throw if args is not a GenObject", async () => {
		const { exitCode, stderr } = await renderCommand({
			argv: ["plop"],
			setup: ({ program }) => {
				program.command("plop").action(async () => {
					try {
						await filePlop({
							args: { foo: "bar" } as any,
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

		expect(exitCode).toBe(1);
		expect(stderr).toContainLine("Only '.gen.json' files are allowed.");
	});

	it("should throw if args is an array of GenObject", async () => {
		const { exitCode, stderr } = await renderCommand({
			argv: ["plop"],
			setup: ({ program }) => {
				program.command("plop").action(async () => {
					try {
						await filePlop({
							args: [genObject] as any,
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

		expect(exitCode).toBe(1);
		expect(stderr).toContainLine("Only one '.gen.json' files are allowed.");
	});

	it("should read JSON if args is a string", async () => {
		vi.spyOn(readJsonModule, "readJson").mockReturnValue(genObject);
		vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("./final-dest");
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const { stdout, exitCode } = await renderCommand({
			argv: ["plop"],
			setup: ({ program }) => {
				program.command("plop").action(async () => {
					try {
						const result = await filePlop({
							args: "path/to/gen.json",
							configPath: "./plopfile.js",
						});
						process.stdout.write(`DEST: ${result.dest}\n`);
						process.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						process.stderr.write(`${message}\n`);
						process.exit(1);
					}
				});
			},
		});

		expect(stdout).toContainLine("DEST: ./final-dest");
		expect(exitCode).toBe(0);
	});

	it("should run generator and log changes and failures", async () => {
		vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("./final-dest");
		MockRunActions.mockReturnValue({
			changes: [{ type: "add", path: "src/index.ts" }],
			failures: [{ type: "error", error: "Oops!" }],
		});

		const { stdout, exitCode } = await renderCommand({
			argv: ["plop"],
			setup: ({ program }) => {
				program.command("plop").action(async () => {
					try {
						const result = await filePlop({
							args: genObject,
							configPath: "./plopfile.js",
						});
						process.stdout.write(`DEST: ${result.dest}\n`);
						process.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						process.stderr.write(`${message}\n`);
						process.exit(1);
					}
				});
			},
		});

		expect(stdout).toContainLine("You use generator my-generator");
		expect(stdout).toContainLine(
			`${chalk.green("✔")} ${chalk.blueBright.bold.italic(`[add]`)} src/index.ts`,
		);
		expect(stdout).toContainLine(
			`${chalk.red("✖")} ${chalk.blueBright.bold.italic(`[error]`)} Oops!`,
		);
		expect(stdout).toContainLine("DEST: ./final-dest");
		expect(exitCode).toBe(0);
	});

	it("should fallback to oldDest if genDest is empty", async () => {
		const minimalGen: GenObject = {
			genName: "simple",
			genId: "002",
			genMeta: {},
			foo: "bar",
		};

		vi.spyOn(pathModule, "pathConstructor").mockImplementation(
			(_genDest, oldDest) => {
				return Promise.resolve(oldDest); // simulate fallback
			},
		);

		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const { stdout, exitCode } = await renderCommand({
			argv: ["plop"],
			setup: ({ program }) => {
				program.command("plop").action(async () => {
					try {
						const result = await filePlop({
							args: minimalGen,
							configPath: "./plopfile.js",
							oldDest: "/fallback",
						});
						process.stdout.write(`DEST: ${result.dest}\n`);
						process.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						process.stderr.write(`${message}\n`);
						process.exit(1);
					}
				});
			},
		});

		expect(stdout).toContainLine("DEST: /fallback");
		expect(exitCode).toBe(0);
	});
});
