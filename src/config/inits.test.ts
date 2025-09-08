import { beforeEach, describe, expect, it } from "vitest";
import type { InitFn } from "../entities/Inits";
import { clearInits, getInits, setInits } from "./inits";

describe("inits state module with InitFn and InitFindDir", () => {
	const mockInitFn: InitFn = ({ initFindDir, configFile, cliFolder }) => ({
		description: "Mock generator",
		actions: [
			{
				type: "add",
				path: initFindDir?.({ nameDir: "src", extraPath: "index.ts" }) || "",
				templateFile: `${cliFolder}/${configFile}`,
			},
		],
	});

	beforeEach(() => {
		clearInits();
	});

	it("sets and retrieves a simple InitFn", () => {
		setInits({
			simple: mockInitFn,
		});

		const result = getInits();
		expect(result.simple).toBe(mockInitFn);
	});

	it("sets and retrieves a named InitFn object", () => {
		setInits({
			named: {
				nameDir: "components",
				InitFn: mockInitFn,
			},
		});

		const result = getInits();
		expect((result.named as any)?.nameDir).toBe("components");
		expect(typeof (result.named as any)?.InitFn).toBe("function");
	});

	it("returns a shallow copy from getInits", () => {
		setInits({ test: mockInitFn });
		const result = getInits();
		expect(result).not.toBe(getInits()); // ensure it's a copy
	});

	it("clears inits", () => {
		setInits({ test: mockInitFn });
		clearInits();
		expect(getInits()).toEqual({});
	});
});
