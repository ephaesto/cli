import readline  from "node:readline";
export const removeLine = (nb: number) =>{
    for (let pas = 0; pas < nb; pas++) {
        readline.moveCursor(process.stdout, 0, -1); // se déplacer d'une ligne vers le haut
        readline.clearLine(process.stdout, 0);
    }
}