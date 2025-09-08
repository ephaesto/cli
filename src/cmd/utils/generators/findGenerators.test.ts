import { describe, expect, it, vi } from "vitest";
import * as globalModule from "~/src/config/global";
import * as rootsModule from "~/src/config/roots";
import type { GeneratorsConfig } from "~/src/entities/Generators";
import * as findRootsModule from "~/src/path/findRoots";
import { renderCommand } from "~/src/test/renderCommand";
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
	it("should return generators directly if subGenConf is false", async () => {
		const config: GeneratorsConfig = {
			defaultGen: createGen("default"),
			otherGen: createGen("other"),
		};

		const result = await findGenerators(config, "defaultGen");
		expect(typeof result.defaultGen).toBe("function");
	});

	it("should return group if typeGen is valid", async () => {
		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("component"),
			},
		};

		const result = await findGenerators(config, "react");
		expect(typeof result.component).toBe("function");
	});

	it("should prompt if typeGen is invalid by command ", async () => {
		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("component"),
			},
			vue: {
				component: createGen("vue"),
			},
		};

		const { stdout, exitCode } = await renderCommand({
			options: { delay: 200 },
			argv: ["gen"],
			setup: ({ program, user }) => {
				program.command("gen").action(async () => {
					const result = findGenerators(config, "angular");
					await user.type("vue");
					await user.pressEnter();
					user.end();
					const selected = await result;
					process.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("⚠ Type Generators angular isn't in the list");
		expect(stdout).toContainLine(
			"? Please choose a type of generator list vue",
		);
		expect(stdout).toContainLine("Selected: component");
		expect(exitCode).toBe(0);
	});

	it("should prompt if typeGen is missing", async () => {
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

		const { stdout, exitCode } = await renderCommand({
			argv: ["gen"],
			setup: ({ program, user }) => {
				program.command("gen").action(async () => {
					const result = findGenerators(config);
					await user.arrowDown();
					await user.pressEnter();
					user.end();
					const selected = await result;
					process.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("Please choose a type of generator list");
		expect(stdout).toContainLine("Selected: component");
		expect(exitCode).toBe(0);
	});

	it("should return generators from rootTypeGen when typeGen is missing", async () => {
		vi.spyOn(readJsonModule, "readJson").mockReturnValue({ typeGen: "react" });

		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("react"),
			},
		};

		const result = await findGenerators(config);

		expect(typeof result.component).toBe("function");
	});

	it("should build parentConfig path using getGlobalConfig when parent is missing", async () => {
		// Spies
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

		const result = await findGenerators(config);

		expect(typeof result.component).toBe("function");
	});

	it("should prompt if typeGen is invalid by file", async () => {
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

		const { stdout, exitCode } = await renderCommand({
			argv: ["gen"],
			setup: ({ program, user }) => {
				program.command("gen").action(async () => {
					const result = findGenerators(config);
					await user.arrowDown();
					await user.pressEnter();
					user.end();
					const selected = await result;
					process.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					process.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("⚠ Type Generators angular isn't in the list");
		expect(stdout).toContainLine("Please choose a type of generator list");
		expect(stdout).toContainLine("Selected: component");
		expect(exitCode).toBe(0);
	});
});
