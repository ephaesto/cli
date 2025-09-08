import { describe, expect, it } from "vitest";
import type { ExtractConfig, ExtractFindDir } from "~/src/entities/Extract";
import { mergeExtractsConfig } from "./mergeExtractsConfig"; // adapte le chemin si besoin

const mockExtractFn = (label: string): ExtractConfig[string] => {
	return () => ({ description: `from ${label}` });
};

describe("mergeExtractsConfig", () => {
	it("should merge all three configs", () => {
		const defaultDirConfig: ExtractConfig = {
			default: mockExtractFn("default"),
		};
		const dirConfig: ExtractConfig = {
			dir: mockExtractFn("dir"),
		};
		const rootConfig: ExtractConfig = {
			root: mockExtractFn("root"),
		};

		const dummyExtractFindDir: ExtractFindDir = () => "dummy/path";

		const result = mergeExtractsConfig({
			dirConfig,
			defaultDirConfig,
			rootConfig,
		});

		expect(Object.keys(result)).toEqual(["default", "dir", "root"]);
		expect(result.default(dummyExtractFindDir).description).toBe(
			"from default",
		);
		expect(result.dir(dummyExtractFindDir).description).toBe("from dir");
		expect(result.root(dummyExtractFindDir).description).toBe("from root");
	});

	it("should handle null configs", () => {
		const result = mergeExtractsConfig({
			dirConfig: null,
			defaultDirConfig: null,
			rootConfig: {
				onlyRoot: mockExtractFn("root"),
			},
		});

		const dummyExtractFindDir: ExtractFindDir = () => "dummy/path";

		expect(Object.keys(result)).toEqual(["onlyRoot"]);
		expect(result.onlyRoot(dummyExtractFindDir).description).toBe("from root");
	});

	it("should override default with dir and root", () => {
		const defaultDirConfig: ExtractConfig = {
			shared: mockExtractFn("default"),
		};
		const dirConfig: ExtractConfig = {
			shared: mockExtractFn("dir"),
		};
		const rootConfig: ExtractConfig = {
			shared: mockExtractFn("root"),
		};

		const dummyExtractFindDir: ExtractFindDir = () => "dummy/path";

		const result = mergeExtractsConfig({
			dirConfig,
			defaultDirConfig,
			rootConfig,
		});

		expect(result.shared(dummyExtractFindDir).description).toBe("from root");
	});

	it("should handle null rootConfig", () => {
		const defaultDirConfig: ExtractConfig = {
			default: () => ({ description: "from default" }),
		};
		const dirConfig: ExtractConfig = {
			dir: () => ({ description: "from dir" }),
		};

		const result = mergeExtractsConfig({
			dirConfig,
			defaultDirConfig,
			rootConfig: null,
		});

		expect(Object.keys(result)).toEqual(["default", "dir"]);
	});
});
