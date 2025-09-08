import { describe, expect, it } from "vitest";
import { renderCommand } from "~/src/test/renderCommand";
import { removeLine } from "./removeLine";

describe("removeLine CLI", () => {
	it("should call removeLine and simulate line removal", async () => {
		const { stdout, exitCode } = await renderCommand({
			argv: ["clear"],
			setup: ({ program, processTerm }) => {
				program.command("clear").action(() => {
					processTerm.stdout.write("Line 1\n");
					processTerm.stdout.write("Line 2\n");
					processTerm.stdout.write("Line 3\n");

					removeLine({ processTerm, nb: 2 });

					processTerm.stdout.write("After clear\n");
					processTerm.exit(0);
				});
			},
		});

		expect(stdout).toContainLine("Line 1");
		expect(stdout).not.toContainLine("Line 2");
		expect(stdout).toContainLine("After clear");
		expect(exitCode).toBe(0);
	});
});
