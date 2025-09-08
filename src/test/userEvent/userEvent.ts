import mockStdin from "mock-stdin";

export function userEvent() {
	const stdin = mockStdin.stdin();

	return {
		type: (text: string) => {
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					stdin.send(text);
					resolve();
				}, 10);
			});
		},
		pressEnter: () => {
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					stdin.send("\n");
					resolve();
				}, 10);
			});
		},
		arrowDown: () => {
			return new Promise<void>((resolve) => {
				setTimeout(() => {
					stdin.send("\u001b[B");
					resolve();
				}, 10);
			});
		},
		end: () => stdin.end(),
	};
}
