import { describe, expect, test } from "vitest";
import { renderCommand } from "../test/renderCommand";
import { removeLine } from "./removeLine";

describe("removeLine CLI", () => {
	test("should call removeLine and simulate line removal", async () => {
		const { stdout, exitCode } = await renderCommand(["clear"], (program) => {
			program.command("clear").action(() => {
				process.stdout.write("Line 1\n");
				process.stdout.write("Line 2\n");
				process.stdout.write("Line 3\n");

				removeLine(2);

				process.stdout.write("After clear\n");
			});
		});

		expect(stdout).toContain("Line 1");
		expect(stdout).not.toContain("Line 2");
		expect(stdout).toContain("After clear");
		expect(exitCode).toBe(0);
	});
});
