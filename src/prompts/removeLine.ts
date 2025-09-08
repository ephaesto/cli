import readline from "node:readline";
export const removeLine = (nb: number) => {
	for (let pas = 0; pas < nb; pas++) {
		readline.moveCursor(process.stdout, 0, -1);
		readline.clearLine(process.stdout, 0);
	}
};
