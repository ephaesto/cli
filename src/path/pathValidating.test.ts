import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { formatError } from "~/src/utils/formatError";
import { logError } from "~/src/utils/logger";
import { pathValidating } from "./pathValidating";

vi.mock("node:fs/promises");
vi.mock("~/src/utils/formatError");
vi.mock("~/src/utils/logger");

beforeEach(() => {
	vi.resetAllMocks();
});

describe("pathValidating", () => {
	it("returns valid path info when path exists", async () => {
		const mockStats = {
			isFile: vi.fn().mockReturnValue(true),
			isDirectory: vi.fn().mockReturnValue(false),
		};

		(fs.stat as unknown as Mock).mockResolvedValue(mockStats);

		const result = await pathValidating("/some/path");

		expect(fs.stat).toHaveBeenCalledWith("/some/path");
		expect(result).toEqual({
			isValidPath: true,
			isDirectory: false,
			isFile: true,
		});
	});

	it("returns invalid path info when stat throws", async () => {
		const fakeError = new Error("ENOENT");
		(fs.stat as unknown as Mock).mockRejectedValue(fakeError);
		(formatError as Mock).mockReturnValue("Formatted error");

		const result = await pathValidating("/invalid/path");

		expect(formatError).toHaveBeenCalledWith(fakeError);
		expect(logError).toHaveBeenCalledWith("Formatted error");
		expect(result).toEqual({
			isValidPath: false,
			isDirectory: false,
			isFile: false,
		});
	});
});
