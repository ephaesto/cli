import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearGenerators, getGenerators } from "~/src/config/generators";
import { StarterConfigError } from "~/src/errors/StarterConfigError";
import { constructorPlop } from "./constructorPlop";

const MockLogger = vi.fn();
vi.mock("~/src/utils/logger", () => ({
	logger: ({ args }: { args: any[] }) => MockLogger(...args),
	logError: vi.fn(),
}));

const MockSearchList = vi.fn();
vi.mock("~/src/prompts/searchList", () => ({
	searchList: (values: any) => MockSearchList(values),
}));

vi.mock("~/src/starter/findStarter", () => {
	const findStarter = (config: Record<string, any>, name: string) =>
		Promise.resolve(config[name]);
	return { findStarter };
});

type GeneratorsConfig = Record<string, Record<string, any>>;
interface MockFindGeneratorsParams {
	config: GeneratorsConfig;
	typeGen: keyof GeneratorsConfig;
}
vi.mock("../generators", () => {
	const findGenerators = ({ config, typeGen }: MockFindGeneratorsParams) =>
		config[typeGen] || { [typeGen]: "mockedGen" };
	return { findGenerators };
});

const MockCallCmdPlop = vi.fn((value = false) => value);
const MockParamsCmdPlop = vi.fn();
vi.mock("../cmdPlop", () => ({
	cmdPlop: async (params: any) => {
		MockParamsCmdPlop(params);
		MockCallCmdPlop(true);
	},
}));

const MockDeepFilePlop = vi.fn((value = false) => value);
vi.mock("../filePlop", () => ({
	deepFilePlop: async (params: any) => MockDeepFilePlop(params),
}));

const MockArgs = vi.fn();
const MockInPath = vi.fn();
vi.mock("../findFilePlopArgs", () => ({
	findFilePlopArgs: async ({ filePlopFn, inPath }: any) => {
		MockInPath(inPath);
		return filePlopFn(MockArgs());
	},
}));

const MockPathConstructor = vi.fn();
vi.mock("~/src/path/pathConstructor", () => ({
	pathConstructor: (value: any) => MockPathConstructor(value),
}));

describe("constructorPlop", () => {
	const processTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
	};

	const baseConfig: any = {
		starterConfig: {
			testStarter: {},
		},
		configPath: "/config",
		generatorsConfig: {},
		processTerm,
	};

	beforeEach(() => {
		clearGenerators();
		MockSearchList.mockReset();
		MockCallCmdPlop.mockClear();
		MockParamsCmdPlop.mockClear();
		MockDeepFilePlop.mockClear();
		MockPathConstructor.mockClear();
		MockArgs.mockClear();
		MockInPath.mockClear();
	});

	it("should throw StarterConfigError for UNKNOWN step", async () => {
		baseConfig.starterConfig.testStarter = {
			step1: { foo: "bar" },
		};
		await expect(() =>
			constructorPlop({
				...baseConfig,
				args: ["testStarter"],
			}),
		).rejects.toThrow(StarterConfigError);
	});

	it("should handle FILTER and resolve nested CMD_PLOP", async () => {
		MockPathConstructor.mockResolvedValue("/filter-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				keyFilter: "level",
				defaultFilter: "default",
				values: {
					default: { generator: "component", typeGen: "react", params: {} },
				},
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		expect(result).toBe(true);
		expect(MockPathConstructor).toHaveBeenCalled();
	});

	it("should handle STARTER and call constructorPlop recursively", async () => {
		MockPathConstructor.mockResolvedValue("/starter-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				starterName: "nestedStarter",
				nameSpace: "ns/",
			},
		};
		baseConfig.starterConfig.nestedStarter = {
			step2: { generator: "component", typeGen: "react", params: {} },
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		expect(result).toBe(true);
		expect(MockPathConstructor).toHaveBeenCalled();
	});

	it("should handle CMD_PLOP and call cmdPlop and setGenerators", async () => {
		MockPathConstructor.mockResolvedValue("/cmd-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				generator: "component",
				typeGen: "react",
				params: {},
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		expect(result).toBe(true);
		expect(MockCallCmdPlop).toHaveBeenCalledWith(true);
		expect(MockPathConstructor).toHaveBeenCalled();
		expect(getGenerators()).toEqual({ react: "mockedGen" });
	});

	it("should handle FILE_PLOP and call deepFilePlop with correct args", async () => {
		MockPathConstructor.mockResolvedValue("/file-path");
		MockArgs.mockReturnValue(["arg1", "arg2"]);

		baseConfig.starterConfig.testStarter = {
			step1: {
				in: "files",
				typeGen: "react",
				force: true,
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		expect(result).toBe(true);
		expect(MockInPath).toHaveBeenCalledWith("files");
		expect(MockArgs).toHaveBeenCalled();
		expect(MockDeepFilePlop).toHaveBeenCalledWith(
			expect.objectContaining({ argsList: ["arg1", "arg2"] }),
		);
	});

	it("should handle MULTI_CHOICE with fallback and nested CMD_PLOP", async () => {
		MockSearchList.mockResolvedValue("tanStack");
		MockPathConstructor.mockResolvedValue("/multi-choice-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				question: "Choose framework",
				name: "framework",
				values: {
					tanStack: { generator: "component", typeGen: "react", params: {} },
					default: { in: "files", typeGen: "react" },
				},
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		expect(result).toBe(true);
		expect(MockSearchList).toHaveBeenCalledWith({
			message: "Choose framework",
			list: ["tanStack", "default"],
			processTerm,
		});
		expect(MockPathConstructor).toHaveBeenCalled();
	});

	it("should handle MULTI_CHOICE with FILTER values and apply filterValues", async () => {
		MockSearchList.mockResolvedValue("typeGen");
		MockPathConstructor.mockResolvedValue("/filtered-multi-choice-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				question: "Choose config",
				name: "configType",
				values: {
					keyFilter: "level",
					defaultFilter: "default",
					values: {
						default: {
							generator: "component",
							typeGen: "react",
							params: "unknown",
						},
					},
				},
			},
		};

		const filters = { level: "default" };

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
			filters,
		});

		expect(result).toBe(true);
		expect(MockSearchList).toHaveBeenCalledWith({
			message: "Choose config",
			list: ["generator", "typeGen", "params"],
			processTerm,
		});
	});

	it("should warn when MULTI_CHOICE value is not in the list", async () => {
		MockSearchList.mockResolvedValue("default");
		MockPathConstructor.mockResolvedValue("/warn-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				question: "Choose framework",
				name: "framework",
				values: {
					tanStack: { generator: "component", typeGen: "react", params: {} },
					default: { in: "files", typeGen: "react" },
				},
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter", { framework: "unknownValue" }],
		});

		expect(result).toBe(true);
		expect(MockSearchList).toHaveBeenCalled();
		expect(MockLogger).toHaveBeenCalledWith(
			expect.stringMatching(/⚠/),
			expect.stringMatching(/framework/),
			expect.stringMatching(/unknownValue/),
			expect.stringMatching(/isn't in the list/),
		);
	});

	it("should prioritize step.force over global force", async () => {
		MockPathConstructor.mockResolvedValue("/force-step-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				generator: "component",
				typeGen: "react",
				params: {},
				force: true,
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
			force: false,
		});

		expect(result).toBe(true);
		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({ force: true }),
		);
	});

	it("should pass step.params to cmdPlop args when defined", async () => {
		MockPathConstructor.mockResolvedValue("/cmd-params-path");

		const params = { name: "Emeric", type: "service" };

		baseConfig.starterConfig.testStarter = {
			step1: {
				generator: "component",
				typeGen: "react",
				params,
			},
		};

		await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: ["component", params],
			}),
		);
	});

	it("should fallback to empty object for cmdPlop args when step.params is undefined", async () => {
		MockPathConstructor.mockResolvedValue("/cmd-no-params-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				generator: "component",
				typeGen: "react",
				// pas de params
			},
		};

		await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: ["component", {}],
			}),
		);
	});

	it("should fallback to 'default' when step.typeGen is undefined", async () => {
		MockPathConstructor.mockResolvedValue("/fallback-typegen-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				generator: "component",
				// typeGen is intentionally omitted
				params: {},
			},
		};

		await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: ["component", {}],
			}),
		);

		expect(getGenerators()).toEqual({ default: "mockedGen" });
	});

	it("should fallback to 'default' when step.typeGen is undefined in FILE_PLOP", async () => {
		MockPathConstructor.mockResolvedValue("/file-fallback-path");
		MockArgs.mockReturnValue(["arg1", "arg2"]);

		baseConfig.starterConfig.testStarter = {
			step1: {
				in: "files",
				// typeGen is intentionally omitted
				force: true,
				deep: true,
				ignoreDest: false,
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		expect(result).toBe(true);
		expect(MockDeepFilePlop).toHaveBeenCalledWith(
			expect.objectContaining({
				typeGen: "default",
			}),
		);
	});
});
