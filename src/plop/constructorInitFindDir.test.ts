import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DIRS } from "~/src/const/dirs";
import { constructorInitFindDir } from "./constructorInitFindDir";

// Mock getDirs and getDirnames
const MockGetDirs = vi.fn((key: string) => {
	if (key === DIRS.DEFAULT_DIR) return "/default";
	if (key === DIRS.DIR) return "/main";
	return "";
});
vi.mock("~/src/config/dirs", () => ({
	getDirs: (params: any) => MockGetDirs(params),
}));

vi.mock("../config/dirnames", () => ({
	getDirnames: vi.fn(() => ({
		custom: "/custom",
		other: "/other",
	})),
}));

describe("constructorInitFindDir", () => {
	let initFactory: ReturnType<typeof constructorInitFindDir>;

	beforeEach(() => {
		initFactory = constructorInitFindDir();
	});

	it("returns correct path for known nameDir", () => {
		const resolver = initFactory("custom");
		const result = resolver("file.txt");
		expect(result).toBe(path.join("/custom", "file.txt"));
	});

	it("uses DIRS.DIR as fallback when nameDir is missing", () => {
		const resolver = initFactory();
		const result = resolver("file.txt");
		expect(result).toBe(path.join("/main", "file.txt"));
	});

	it("uses DIRS.DIR as fallback when nameDir is unknown", () => {
		const resolver = initFactory("unknown");
		const result = resolver("file.txt");
		expect(result).toBe(path.join("/main", "file.txt"));
	});

	it("returns base path when extraPath is empty", () => {
		const resolver = initFactory("other");
		const result = resolver("other");
		expect(result).toBe("/other/other");
	});

	it("returns correct path when name is passed to outer function", () => {
		const resolver = initFactory("custom");
		const result = resolver("");
		expect(result).toBe("/custom");
	});

	it("uses empty string when getDirs(DIRS.DEFAULT_DIR) returns undefined", () => {
		MockGetDirs.mockReturnValue("");
		const initFactory = constructorInitFindDir();
		const resolver = initFactory("defaultDir");

		// defaultDir is undefined → fallback to ""
		const result = resolver("file.txt");
		expect(result).toBe(path.join("", "file.txt")); // 👈 fallback path
	});
});
