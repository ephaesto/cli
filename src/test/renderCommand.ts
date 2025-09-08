import chalk from "chalk";
import { Command } from "commander";
import { userEvent } from "./userEvent/userEvent";

export function countRemoveSequences(input: string): number {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: <test utils>
	const pattern = /\u001b\[1A\u001b\[2K/g;
	const matches = input.match(pattern);
	return matches ? matches.length : 0;
}

chalk.level = 3;

export function renderCommand(
	argv: string[],
	setup: (program: Command, user: ReturnType<typeof userEvent>) => void,
): Promise<{
	stdout: string;
	stderr: string;
	exitCode: number;
}> {
	const visualLines: string[] = [];
	let stderr = "";
	let exitCode = 0;

	const originalStdoutWrite = process.stdout.write.bind(process.stdout);
	const originalStderrWrite = process.stderr.write.bind(process.stderr);

	let lastLineIsUp = false;

	process.stdout.write = ((chunk: any) => {
		const text = typeof chunk === "string" ? chunk : chunk.toString();
		const lines = text.split("\n");

		lines.forEach((line: string) => {
			if (line.includes("\u001b[1A\u001b[2K")) {
				const count = countRemoveSequences(line);
				visualLines.splice(-count, count);
				// biome-ignore lint/suspicious/noControlCharactersInRegex: <test utils>
				const newLine = line.replace(/\u001b\[1A\u001b\[2K/g, "");
				if (newLine.length) {
					visualLines.push(newLine);
				}
				return;
			}
			if (line.startsWith("\u001b[2K") && lastLineIsUp) {
				lastLineIsUp = false;
				visualLines.pop();
				// biome-ignore lint/suspicious/noControlCharactersInRegex: <test utils>
				const value = line.replace(/^\u001b\[2K/, "").trim();
				if (value.length) {
					visualLines.push(value);
				}
				return;
			}
			if (line.endsWith("\u001b[1A")) {
				lastLineIsUp = true;
				// biome-ignore lint/suspicious/noControlCharactersInRegex: <test utils>
				const value = line.replace(/\u001b\[1A$/, "").trim();
				if (value.length) {
					visualLines.push(value);
				}
				return;
			}
			if (lastLineIsUp) {
				lastLineIsUp = false;
			}
			if (line) {
				visualLines.push(line);
			}
		});

		return true;
	}) as typeof process.stdout.write;

	process.stderr.write = ((chunk: any) => {
		stderr += typeof chunk === "string" ? chunk : chunk.toString();
		return true;
	}) as typeof process.stderr.write;

	return new Promise((resolve) => {
		const program = new Command();
		program.exitOverride((err) => {
			exitCode = err.exitCode ?? 1;
			throw err;
		});
		const user = userEvent();
		setup(program, user);

		try {
			program.parse([...argv], { from: "user" });
		} catch {
			// error already captured via exitOverride
		} finally {
			const finish = () => {
				process.stdout.write = originalStdoutWrite;
				process.stderr.write = originalStderrWrite;
				resolve({
					stdout: visualLines.join("\n").trim(),
					stderr: stderr.trim(),
					exitCode,
				});
			};

			if (user) {
				setTimeout(finish, 200);
			} else {
				finish();
			}
		}
	});
}
