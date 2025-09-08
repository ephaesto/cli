import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { findAllGenJson } from "./findAllGenJson";

vi.mock("node:fs/promises");

beforeEach(() => {
	vi.resetAllMocks();
});

describe("findAllGenJson", () => {
	it("returns only .gen.json files", async () => {
		const mockDirents = [
			{ name: "data.gen.json", isDirectory: () => false },
			{ name: "other.json", isDirectory: () => false },
			{ name: "folder", isDirectory: () => true },
			{ name: "config.gen.json", isDirectory: () => false },
		];

		(fs.readdir as Mock).mockResolvedValue(mockDirents);

		const result = await findAllGenJson("/some/path");

		expect(result).toEqual(["data.gen.json", "config.gen.json"]);
	});

	it("returns empty array when no .gen.json files are found", async () => {
		const mockDirents = [
			{ name: "data.json", isDirectory: () => false },
			{ name: "folder", isDirectory: () => true },
			{ name: "notes.txt", isDirectory: () => false },
		];

		(fs.readdir as Mock).mockResolvedValue(mockDirents);

		const result = await findAllGenJson("/some/path");

		expect(result).toEqual([]);
	});

	it("returns empty array when directory is empty", async () => {
		(fs.readdir as Mock).mockResolvedValue([]);

		const result = await findAllGenJson("/empty");

		expect(result).toEqual([]);
	});
});
