import { beforeEach, describe, expect, it } from "vitest";
import { clearGlobalConfig, getGlobalConfig, setGlobalConfig } from "./global";

describe("globalConfig store", () => {
	beforeEach(() => {
		clearGlobalConfig();
	});

	it("sets and gets globalConfig correctly", () => {
		const config = { configFile: "custom.json", rootKey: "customRoot" };

		setGlobalConfig(config);

		const result = getGlobalConfig();
		expect(result).toEqual(config);
	});

	it("returns a copy, not a reference", () => {
		const config = { configFile: "custom.json" };
		setGlobalConfig(config);

		const result = getGlobalConfig();
		result.configFile = "hacked.json";

		expect(getGlobalConfig().configFile).toBe("custom.json");
	});

	it("clears globalConfig", () => {
		setGlobalConfig({ configFile: "custom.json" });

		clearGlobalConfig();

		expect(getGlobalConfig()).toEqual({});
	});
});
