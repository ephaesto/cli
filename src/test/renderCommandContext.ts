interface CommandContext {
	stdout: any;
	delay: number;
}

interface RenderCommandContext {
	[x: string]: CommandContext;
}

const context: RenderCommandContext = {};

export const createRenderCommandContext = (
	seed: string,
	newContext: CommandContext,
): void => {
	context[seed] = newContext;
};

export const getRenderCommandContext = (
	seed: string,
):
	| CommandContext
	| {
			stdout: null;
			delay: 100;
	  } =>
	context[seed] || {
		stdout: null,
		delay: 100,
	};

export const getStdout = (seed: string): any => context[seed]?.stdout || null;

export const getDelay = (seed: string): number => context[seed]?.delay || 100;

export const cleanRenderCommandContext = (seed: string): void => {
	delete context[seed];
};
