import { Generators } from "../entities/Generators";
import { Roots } from "../entities/Roots";

let generators: Partial<Generators> = {
 
}

export const setGenerators = (newGenerators: Partial<Generators>) => {
    generators = {...newGenerators}
}

export const getGenerators = (): Partial<Generators> => {
   return {...generators};
}