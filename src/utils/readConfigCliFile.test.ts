import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearGlobalConfig, setGlobalConfig } from "~/src/config/global";
import { readConfigCliFile } from "~/src/utils/readConfigCliFile";

const mockRead = vi.fn((path: string) => ({ path, config: "mocked" }));

beforeEach(() => {
	mockRead.mockClear();
	clearGlobalConfig();
});

describe("readConfigCliFile", () => {
	it("uses global config values when available", () => {
		setGlobalConfig({
			configFileExt: "customExt",
			configFileType: "customType",
			findFile: {
				customExt: {
					customType: { read: mockRead, write: mockRead },
				},
			},
		});

		const result = readConfigCliFile("cli.config");

		expect(mockRead).toHaveBeenCalledWith("cli.config");
		expect(result).toEqual({ path: "cli.config", config: "mocked" });
	});

	it("uses default constants when global config is missing", () => {
		setGlobalConfig({
			findFile: {
				json: {
					camelCase: { read: mockRead, write: mockRead },
				},
			},
		});

		const result = readConfigCliFile("cli.config");

		expect(mockRead).toHaveBeenCalledWith("cli.config");
		expect(result).toEqual({ path: "cli.config", config: "mocked" });
	});

	it("throws when read function is missing in findFile", () => {
		setGlobalConfig({
			configFileExt: "missingExt",
			configFileType: "missingType",
			findFile: {},
		});

		expect(() => readConfigCliFile("cli.config")).toThrowError(
			"Find files missingExt missingType read function doesn't exist",
		);
	});

	it("falls back to empty object when global config is undefined", () => {
		// No setGlobalConfig call → getGlobalConfig() returns undefined
		expect(() => readConfigCliFile("cli.config")).toThrowError(
			"Find files json camelCase read function doesn't exist",
		);
	});

	it("throws when findFile[ext] exists but not findFile[ext][type]", () => {
		setGlobalConfig({
			configFileExt: "yaml",
			configFileType: "missingType",
			findFile: {
				yaml: {
					// missingType intentionally omitted
				},
			},
		});

		expect(() => readConfigCliFile("cli.config")).toThrowError(
			"Find files yaml missingType read function doesn't exist",
		);
	});
});
