import { Roots } from "../entities/Roots";

const roots: Roots = {
    '~': null,
    '~~': null,
}

export const setRoots = (newRoots: Partial<Roots>) => {
    Object.entries(newRoots).forEach(([name, value]) => {
            if(value){
                roots[name] = value;
            }
        }
    )
}

export const getRoots = (keyRoots: keyof Roots) =>{
   return roots[keyRoots];
}