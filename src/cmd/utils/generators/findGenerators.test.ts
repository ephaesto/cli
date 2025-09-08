import { describe, expect, it, vi } from "vitest";
import * as globalModule from "~/src/config/global";
import * as rootsModule from "~/src/config/roots";
import type { GeneratorsConfig } from "~/src/entities/Generators";
import * as findRootsModule from "~/src/path/findRoots";
import { renderCommand } from "~/src/test/renderCommand";
import { userEvent } from "~/src/test/userEvent";
import * as readJsonModule from "~/src/utils/readJson";
import { findGenerators } from "./findGenerators";

const MockExistsSync = vi.fn(() => true);

vi.mock("node:fs", () => ({
	default: {
		existsSync: () => MockExistsSync,
	},
}));

const createGen = (label: string) => () => ({
	description: `Generator for ${label}`,
});

describe("findGenerators", () => {
	const globalProcessTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
	};

	it("should return generators directly if subGenConf is false", async () => {
		// Arrange/Act
		const config: GeneratorsConfig = {
			defaultGen: createGen("default"),
			otherGen: createGen("other"),
		};

		// Assert
		const result = await findGenerators({
			config,
			typeGen: "defaultGen",
			processTerm: globalProcessTerm,
		});
		expect(typeof result.defaultGen).toBe("function");
	});

	it("should return group if typeGen is valid", async () => {
		// Arrange/Act
		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("component"),
			},
		};

		// Assert
		const result = await findGenerators({
			config,
			typeGen: "react",
			processTerm: globalProcessTerm,
		});
		expect(typeof result.component).toBe("function");
	});

	it("should prompt if typeGen is invalid by command ", async () => {
		// Arrange
		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("component"),
			},
			vue: {
				component: createGen("vue"),
			},
		};

		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["gen"],
			setup: ({ program, processTerm }) => {
				program.command("gen").action(async () => {
					const selected = await findGenerators({
						config,
						typeGen: "angular",
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.type("vue");
		user.pressEnter();
		user.waitWrite("Selected: component");
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("⚠ Type Generators angular isn't in the list");
		expect(stdout).toContainLine(
			"? Please choose a type of generator list vue",
		);
		expect(stdout).toContainLine("Selected: component");
		expect(exitCode).toBe(0);
	});

	it("should prompt if typeGen is missing", async () => {
		// Arrange
		vi.spyOn(readJsonModule, "readJson").mockReturnValue({});
		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("react"),
			},
			vue: {
				component: createGen("vue"),
			},
		};

		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["gen"],
			setup: ({ program, processTerm }) => {
				program.command("gen").action(async () => {
					const selected = await findGenerators({ config, processTerm });
					processTerm.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.arrowDown();
		user.pressEnter();
		user.waitWrite("Selected: component");
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("Please choose a type of generator list");
		expect(stdout).toContainLine("Selected: component");
		expect(exitCode).toBe(0);
	});

	it("should return generators from rootTypeGen when typeGen is missing", async () => {
		// Arrange/ Act
		vi.spyOn(readJsonModule, "readJson").mockReturnValue({ typeGen: "react" });

		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("react"),
			},
		};

		const result = await findGenerators({
			config,
			processTerm: globalProcessTerm,
		});

		// Assert
		expect(typeof result.component).toBe("function");
	});

	it("should build parentConfig path using getGlobalConfig when parent is missing", async () => {
		// Arrange/ Act
		vi.spyOn(rootsModule, "getRoots").mockReturnValue(null);
		vi.spyOn(findRootsModule, "findRoots").mockReturnValue({
			"~": null,
		} as any);
		vi.spyOn(globalModule, "getGlobalConfig").mockReturnValue({});
		vi.spyOn(readJsonModule, "readJson").mockReturnValue({ typeGen: "react" });

		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("react"),
			},
		};

		const result = await findGenerators({
			config,
			processTerm: globalProcessTerm,
		});

		// Assert
		expect(typeof result.component).toBe("function");
	});

	it("should prompt if typeGen is invalid by file", async () => {
		// Arrange
		vi.spyOn(readJsonModule, "readJson").mockReturnValue({
			typeGen: "angular",
		});
		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("react"),
			},
			vue: {
				component: createGen("vue"),
			},
		};

		const user = userEvent();
		const render = renderCommand({
			user,
			argv: ["gen"],
			setup: ({ program, processTerm }) => {
				program.command("gen").action(async () => {
					const selected = await findGenerators({ config, processTerm });
					processTerm.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.arrowDown();
		user.pressEnter();
		user.waitWrite("Selected: component");
		const { stdout, exitCode } = await render;

		// Assert
		expect(stdout).toContainLine("⚠ Type Generators angular isn't in the list");
		expect(stdout).toContainLine("Please choose a type of generator list");
		expect(stdout).toContainLine("Selected: component");
		expect(exitCode).toBe(0);
	});
});
