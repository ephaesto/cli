import chalk from "chalk";
import { Command } from "commander";
import { createEventBus, getEventBus } from "./eventBus";
import { FakeTerminal } from "./FakeTerminal";
import { formatError } from "./formatError";
import { debugCommandTest, debugTermTest } from "./loggerTest";
import { userEvent } from "./userEvent";

export function countRemoveSequences(input: string): number {
	const pattern = /\u001b\[1A\u001b\[2K/g;
	const matches = input.match(pattern);
	return matches ? matches.length : 0;
}

chalk.level = 3;

interface RenderCommand {
	stdout: string[];
	stderr: string[];
	exitCode: number;
	debug: (value: string[], escapeAnsi?: boolean) => void;
	debugTerm: (escapeAnsi?: boolean) => void;
}

interface SetupParams {
	program: Command;
	user: ReturnType<typeof userEvent>;
	debug: (value: string[], escapeAnsi?: boolean) => void;
}

interface RenderCommandParams {
	argv: string[];
	setup: (params: SetupParams) => void;
	options?: {
		delay?: number;
		enableLogTerm?: boolean;
	};
}

export async function renderCommand({
	argv,
	setup,
	options: { delay = 300, enableLogTerm = false } = {
		delay: 300,
		enableLogTerm: false,
	},
}: RenderCommandParams): Promise<RenderCommand> {
	const seed = crypto.randomUUID();
	createEventBus(seed);
	const stdout: string[] = [];
	const stderr: string[] = [];
	let exitCode = 990;

	const originalStdoutWrite = process.stdout.write.bind(process.stdout);
	const originalStderrWrite = process.stderr.write.bind(process.stderr);
	const originalProcessExit = process.exit;

	const fakeTerminal = new FakeTerminal(enableLogTerm, seed);

	process.stdout.write = ((chunk: any) => {
		fakeTerminal.write(chunk);
		return true;
	}) as typeof process.stdout.write;

	process.stderr.write = ((chunk: any) => {
		const text = typeof chunk === "string" ? chunk : chunk.toString();
		const lines = text.split("\n").filter(Boolean);
		stderr.push(...lines);
		return true;
	}) as typeof process.stderr.write;

	process.exit = ((code?: number) => {
		exitCode = code ?? 999;
		return undefined as never;
	}) as typeof process.exit;

	const program = new Command();

	const finish = (): RenderCommand => {
		process.stdout.write = originalStdoutWrite;
		process.stderr.write = originalStderrWrite;
		process.exit = originalProcessExit;

		stdout.push(`\n${fakeTerminal.getOutput().trim()}\n`);

		return {
			stdout,
			stderr: [`\n${stderr.join("\n").trim()}\n`],
			exitCode,
			debug: debugCommandTest(process.stdout.write),
			debugTerm: debugTermTest(process.stdout.write, fakeTerminal.getLogger()),
		};
	};

	const user = userEvent(() => {
		stdout.push(`\n${fakeTerminal.getOutput().trim()}\n`);
	});

	try {
		setup({ program, user, debug: debugCommandTest(process.stdout.write) });
	} catch (err) {
		const { message } = formatError(err);
		stderr.push(`${message}`);
		exitCode = 999;
	}

	const stopIfToLong = (innerSeed: string) =>
		new Promise<RenderCommand>((resolve) => {
			let finishTimeout: NodeJS.Timeout | null = null;
			const scheduleResult = () => {
				if (finishTimeout) clearTimeout(finishTimeout);
				finishTimeout = setTimeout(() => {
					resolve(finish());
				}, delay);
			};
			if (!finishTimeout) scheduleResult();
			const eventBus = getEventBus(innerSeed);
			eventBus.on("action", () => {
				scheduleResult();
			});
		});

	const parse = async () => {
		try {
			await program.parseAsync([...argv], { from: "user" });
		} catch (err) {
			const { message } = formatError(err);
			stderr.push(`Runtime error: ${message}`);
			exitCode = 998;
		}
		return finish();
	};

	return Promise.race([parse(), stopIfToLong(seed)]);
}
