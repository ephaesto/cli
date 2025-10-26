import { describe, expect, it, vi } from "vitest";
import { FilePathError } from "~/src/errors/FilePathError";
import { findFilePlopArgs } from "./findFilePlopArgs";

const mockFindAllGenFile = vi.fn(() =>
	Promise.resolve(["/mock/path/a.gen.json", "/mock/path/b.gen.json"]),
);
const mockPathConstructor = vi.fn(() => Promise.resolve("/mock/path"));
const mockPathValidating = vi.fn(() =>
	Promise.resolve({
		isValidPath: true,
		isDirectory: false,
		isFile: true,
	}),
);

vi.mock("../../path/findAllGenFile", () => ({
	findAllGenFile: () => mockFindAllGenFile(),
}));

vi.mock("../../path/pathConstructor", () => ({
	pathConstructor: () => mockPathConstructor(),
}));

vi.mock("../../path/pathValidating", () => ({
	pathValidating: () => mockPathValidating(),
}));

describe("findFilePlopArgs", () => {
	it("should call filePlopFn with .gen.json file", async () => {
		const filePlopFn = vi.fn(() => Promise.resolve());

		mockPathConstructor.mockReturnValue(
			Promise.resolve("/mock/path/file.gen.json"),
		);

		await findFilePlopArgs({
			filePlopFn,
			inPath: "/mock/path/file.gen.json",
			parentConfig: null,
		});

		expect(filePlopFn).toHaveBeenCalledWith(["/mock/path/file.gen.json"]);
	});

	it("should call filePlopFn with all .gen.json files in directory", async () => {
		const filePlopFn = vi.fn(() => Promise.resolve());

		mockPathValidating.mockReturnValue(
			Promise.resolve({
				isValidPath: true,
				isDirectory: true,
				isFile: false,
			}),
		);

		await findFilePlopArgs({
			filePlopFn,
			inPath: "/mock/path",
			parentConfig: null,
		});

		expect(filePlopFn).toHaveBeenCalledWith([
			"/mock/path/a.gen.json",
			"/mock/path/b.gen.json",
		]);
	});

	it("should throw FilePathError for invalid file", async () => {
		const filePlopFn = vi.fn(() => Promise.resolve());

		mockPathConstructor.mockReturnValue(
			Promise.resolve("/mock/path/invalid.txt"),
		);

		mockPathValidating.mockReturnValue(
			Promise.resolve({
				isValidPath: true,
				isDirectory: false,
				isFile: false,
			}),
		);

		await expect(
			findFilePlopArgs({
				filePlopFn,
				inPath: "/mock/path/invalid.txt",
				parentConfig: null,
			}),
		).rejects.toThrow(FilePathError);
	});

	it("should not call filePlopFn if path is invalid", async () => {
		const filePlopFn = vi.fn(() => Promise.resolve());

		mockPathValidating.mockReturnValue(
			Promise.resolve({
				isValidPath: false,
				isDirectory: false,
				isFile: false,
			}),
		);

		await findFilePlopArgs({
			filePlopFn,
			inPath: "/mock/path",
			parentConfig: null,
		});

		expect(filePlopFn).not.toHaveBeenCalled();
	});

	it("throws FilePathError when file is not a valid .gen file", async () => {
		const filePlopFn = vi.fn(() => Promise.resolve());

		mockPathConstructor.mockReturnValue(
			Promise.resolve("/mock/path/not-gen.txt"),
		);
		mockPathValidating.mockReturnValue(
			Promise.resolve({
				isValidPath: true,
				isDirectory: false,
				isFile: true,
			}),
		);

		await expect(
			findFilePlopArgs({
				filePlopFn,
				inPath: "/mock/path/not-gen.txt",
				parentConfig: { genFileExt: "json" },
			}),
		).rejects.toThrow('Only ".gen.json" files are allowed.');
	});

	it("should not call filePlopFn when directory has no .gen.json files", async () => {
		const filePlopFn = vi.fn(() => Promise.resolve());

		mockPathValidating.mockReturnValue(
			Promise.resolve({
				isValidPath: true,
				isDirectory: true,
				isFile: false,
			}),
		);

		mockFindAllGenFile.mockReturnValue([] as any);

		await findFilePlopArgs({
			filePlopFn,
			inPath: "/mock/path",
			parentConfig: null,
		});

		expect(filePlopFn).not.toHaveBeenCalled();
	});
});
