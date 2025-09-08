import { beforeEach, describe, expect, it, vi } from "vitest";
import * as globalConfig from "~/src/config/global";
import setup from "./setup";

let plopMock: any;

beforeEach(() => {
	plopMock = {
		setHelper: vi.fn(),
		setPartial: vi.fn(),
		setActionType: vi.fn(),
		setPrompt: vi.fn(),
	};

	vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue({
		helpers: {
			upper: (txt: string) => txt.toUpperCase(),
		},
		partials: {
			header: "<h1>{{title}}</h1>",
		},
		actions: {
			log: () => "action",
		},
		prompts: {
			customPrompt: (() => ({ name: "custom" })) as any,
		},
	});
});

describe("setup registers plop extensions", () => {
	it("registers helpers", () => {
		setup(plopMock);
		expect(plopMock.setHelper).toHaveBeenCalledWith(
			"upper",
			expect.any(Function),
		);
	});

	it("registers partials", () => {
		setup(plopMock);
		expect(plopMock.setPartial).toHaveBeenCalledWith(
			"header",
			"<h1>{{title}}</h1>",
		);
	});

	it("registers actions", () => {
		setup(plopMock);
		expect(plopMock.setActionType).toHaveBeenCalledWith(
			"log",
			expect.any(Function),
		);
	});

	it("registers prompts", () => {
		setup(plopMock);
		expect(plopMock.setPrompt).toHaveBeenCalledWith(
			"customPrompt",
			expect.any(Function),
		);
	});
	it("does nothing when getGlobalConfig returns undefined", () => {
		vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue(undefined);

		setup(plopMock);

		expect(plopMock.setHelper).not.toHaveBeenCalled();
		expect(plopMock.setPartial).not.toHaveBeenCalled();
		expect(plopMock.setActionType).not.toHaveBeenCalled();
		expect(plopMock.setPrompt).not.toHaveBeenCalled();
	});

	it("skips helpers when helpers are missing", () => {
		vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue({
			partials: { header: "<h1>{{title}}</h1>" },
			actions: { log: () => "action" },
			prompts: { customPrompt: () => ({ name: "custom" }) },
		});

		setup(plopMock);

		expect(plopMock.setHelper).not.toHaveBeenCalled();
		expect(plopMock.setPartial).toHaveBeenCalled();
		expect(plopMock.setActionType).toHaveBeenCalled();
		expect(plopMock.setPrompt).toHaveBeenCalled();
	});

	it("skips partials when partials are missing", () => {
		vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue({
			helpers: { upper: (txt: string) => txt.toUpperCase() },
			actions: { log: () => "action" },
			prompts: { customPrompt: () => ({ name: "custom" }) },
		});

		setup(plopMock);

		expect(plopMock.setPartial).not.toHaveBeenCalled();
		expect(plopMock.setHelper).toHaveBeenCalled();
		expect(plopMock.setActionType).toHaveBeenCalled();
		expect(plopMock.setPrompt).toHaveBeenCalled();
	});

	it("skips actions when actions are missing", () => {
		vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue({
			helpers: { upper: (txt: string) => txt.toUpperCase() },
			partials: { header: "<h1>{{title}}</h1>" },
			prompts: { customPrompt: () => ({ name: "custom" }) },
		});

		setup(plopMock);

		expect(plopMock.setActionType).not.toHaveBeenCalled();
		expect(plopMock.setHelper).toHaveBeenCalled();
		expect(plopMock.setPartial).toHaveBeenCalled();
		expect(plopMock.setPrompt).toHaveBeenCalled();
	});

	it("skips prompts when prompts are missing", () => {
		vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue({
			helpers: { upper: (txt: string) => txt.toUpperCase() },
			partials: { header: "<h1>{{title}}</h1>" },
			actions: { log: () => "action" },
		});

		setup(plopMock);

		expect(plopMock.setPrompt).not.toHaveBeenCalled();
		expect(plopMock.setHelper).toHaveBeenCalled();
		expect(plopMock.setPartial).toHaveBeenCalled();
		expect(plopMock.setActionType).toHaveBeenCalled();
	});
});
