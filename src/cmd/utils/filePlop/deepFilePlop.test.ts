import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDirs } from "~/src/config/dirs";
import { clearGlobalConfig } from "~/src/config/global";
import { clearRoots, setRoots } from "~/src/config/roots";
import { ROOTS } from "~/src/const/roots";
import type { GenObject } from "~/src/entities/GenObject";
import * as readConfigCliFileModule from "~/src/utils/readConfigCliFile";
import * as readGenFileModule from "~/src/utils/readGenFile";
import * as generatorsModule from "../generators";
import { deepFilePlop } from "./deepFilePlop";
import * as filePlopModule from "./filePlop";

const genObject: GenObject = {
	genName: "my-generator",
	genId: "001",
	genMeta: {},
	genDest: "./generated",
	foo: "bar",
};

beforeEach(() => {
	vi.resetAllMocks();
	clearRoots();
	clearGlobalConfig();
	clearDirs();
});

describe("deepFilePlop", () => {
	const processTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
	};
	it("should run filePlop once and return true", async () => {
		setRoots({ [ROOTS.PARENT]: "/project" });

		vi.spyOn(generatorsModule, "findGenerators").mockResolvedValue({
			subGenConf: true,
		} as any);
		vi.spyOn(filePlopModule, "filePlop").mockResolvedValue({
			argsList: [],
			dest: "./final",
			genFileName: "",
		});

		const result = await deepFilePlop({
			argsList: [genObject],
			configPath: "./plopfile.js",
			generatorsConfig: {},
			processTerm,
			parentConfig: null,
		});

		expect(result).toBe(true);
	});

	it("should re-fetch generators if parent mismatch and subGenConf is false", async () => {
		vi.spyOn(readGenFileModule, "readGenFile").mockReturnValue(genObject);
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		setRoots({ [ROOTS.PARENT]: "/parent" });

		vi.spyOn(generatorsModule, "findGenerators")
			.mockResolvedValueOnce({ subGenConf: false } as any)
			.mockResolvedValueOnce({ subGenConf: false } as any);

		vi.spyOn(filePlopModule, "filePlop").mockResolvedValue({
			argsList: [],
			dest: "./final",
			genFileName: "",
		});

		const result = await deepFilePlop({
			argsList: [genObject],
			configPath: "./plopfile.js",
			dest: "/outside",
			generatorsConfig: {},
			processTerm,
			parentConfig: null,
		});

		expect(result).toBe(true);
	});

	it("should recursively call deepFilePlop with child argsList", async () => {
		setRoots({ [ROOTS.PARENT]: "/project" });

		const filePlopMock = vi
			.spyOn(filePlopModule, "filePlop")
			.mockResolvedValueOnce({
				argsList: [
					{
						genName: "child-generator",
						genId: "002",
						genMeta: {},
						foo: "baz",
					},
				],
				dest: "./child",
				genFileName: "",
			})
			.mockResolvedValueOnce({
				argsList: [],
				dest: "./child",
				genFileName: "",
			});

		vi.spyOn(generatorsModule, "findGenerators").mockResolvedValue({
			subGenConf: true,
		} as any);

		const result = await deepFilePlop({
			argsList: [genObject],
			configPath: "./plopfile.js",
			generatorsConfig: {},
			processTerm,
			parentConfig: null,
		});

		expect(filePlopMock).toHaveBeenCalledTimes(2);
		expect(result).toBe(true);
	});

	it("should return true immediately if argsList is empty", async () => {
		const result = await deepFilePlop({
			argsList: [],
			configPath: "./plopfile.js",
			generatorsConfig: {},
			processTerm,
			parentConfig: null,
		});

		expect(result).toBe(true);
	});
});
