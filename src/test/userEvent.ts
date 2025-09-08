import mockStdin from "mock-stdin";

export function userEvent(captureFn?: () => void) {
	const stdin = mockStdin.stdin();

	return {
		type: (text: string) => {
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					if (captureFn) captureFn();
					stdin.send(text);
					resolve();
				}, 10);
			});
		},
		pressEnter: () => {
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					if (captureFn) captureFn();
					stdin.send("\n");
					resolve();
				}, 10);
			});
		},
		arrowDown: () => {
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					if (captureFn) captureFn();
					stdin.send("\u001b[B");
					resolve();
				}, 10);
			});
		},
		end: () => {
			if (captureFn) captureFn();
			return stdin.end();
		},
	};
}
