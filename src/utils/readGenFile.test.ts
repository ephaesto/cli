import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearGlobalConfig, setGlobalConfig } from "~/src/config/global";
import { readGenFile } from "~/src/utils/readGenFile";

const mockRead = vi.fn((path: string) => ({ path, content: "mocked" }));

beforeEach(() => {
	mockRead.mockClear();
	clearGlobalConfig();
});

describe("readGenFile", () => {
	it("uses parentConfig values when provided", () => {
		setGlobalConfig({
			genFileExt: "ignored",
			genFileType: "ignored",
			findFile: {
				customExt: {
					customType: { read: mockRead, write: mockRead },
				},
			},
		});

		const result = readGenFile("file.txt", {
			genFileExt: "customExt",
			genFileType: "customType",
		});

		expect(mockRead).toHaveBeenCalledWith("file.txt");
		expect(result).toEqual({ path: "file.txt", content: "mocked" });
	});

	it("falls back to global config when parentConfig is null", () => {
		setGlobalConfig({
			genFileExt: "customExt",
			genFileType: "customType",
			findFile: {
				customExt: {
					customType: { read: mockRead, write: mockRead },
				},
			},
		});

		const result = readGenFile("file.txt", null);

		expect(mockRead).toHaveBeenCalledWith("file.txt");
		expect(result).toEqual({ path: "file.txt", content: "mocked" });
	});

	it("uses default constants when no config is available", () => {
		setGlobalConfig({
			findFile: {
				json: {
					camelCase: { read: mockRead, write: mockRead },
				},
			},
		});

		const result = readGenFile("file.txt", {
			genFileExt: undefined,
			genFileType: undefined,
		});

		expect(mockRead).toHaveBeenCalledWith("file.txt");
		expect(result).toEqual({ path: "file.txt", content: "mocked" });
	});

	it("throws when read function is missing", () => {
		setGlobalConfig({
			genFileExt: "missingExt",
			genFileType: "missingType",
			findFile: {},
		});

		expect(() => readGenFile("file.txt", null)).toThrowError(
			"Find files missingExt missingType read function doesn't exist",
		);
	});

	it("falls back to empty object when global config is undefined", () => {
		expect(() =>
			readGenFile("file.txt", {
				genFileExt: "json",
				genFileType: "camelCase",
			}),
		).toThrowError("Find files json camelCase read function doesn't exist");
	});
});
