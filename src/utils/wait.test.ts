import { describe, expect, test, vi } from "vitest";
import { wait } from "./wait";

describe("wait", () => {
	test("should resolve after the specified time", async () => {
		vi.useFakeTimers();

		const spy = vi.fn();
		wait(2).then(spy);

		expect(spy).not.toHaveBeenCalled();

		vi.advanceTimersByTime(2);
		await vi.runAllTicks();

		expect(spy).toHaveBeenCalled();
	});
});
