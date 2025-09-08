import nodePath from 'node:path';

export const isGenJson= (path: string): boolean => {
    const {base} = nodePath.parse(path)
   const regExp = new RegExp("[\.]gen[\.]json")
   return regExp.test(base)
}