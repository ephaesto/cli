import nodePath from 'node:path';
import { findRoots } from './findRoots';
import { FilePathError } from '../errors/FilePathError';
import { getRoots, setRoots } from '../config/roots';
import { getGlobalConfig } from '../config/global';



export const pathConstructor = async(strPath: any, oldPath: string = process.cwd()): Promise<string> => {
    if(strPath && typeof strPath === "string"){
        const isParentPath = (new RegExp('^~/')).test(strPath);
        if(isParentPath){
            const sanitizePath = strPath.slice(1)
            const parent = getRoots('~')
            if(parent){
                return nodePath.join(parent, sanitizePath)
            }
            const currentRoots = findRoots()
            
            if (currentRoots['~']) {
                setRoots(currentRoots)
                return nodePath.join(currentRoots['~'], sanitizePath)
            }
            throw new FilePathError(`The ~ option requires at least one '${ getGlobalConfig()?.configFile || 'config.cli.json'}' file to be present.`)
        }
        const isRootPath = (new RegExp('^~~/')).test(strPath);
        if(isRootPath){
            const sanitizePath = strPath.slice(2)
            const root = getRoots('~~')
            if(root){
                return nodePath.join(root, sanitizePath)
            }
            const currentRoots = findRoots()
            if (currentRoots['~~']) {
                setRoots({'~~': currentRoots['~~']})
                return nodePath.join(currentRoots['~~'], sanitizePath)
            }
            throw new FilePathError(`The ~~ option requires at least one '${ getGlobalConfig()?.configFile || 'config.cli.json'}' file in which root parameter set to 'true'`)
        }
        if(nodePath.isAbsolute(strPath)){
            return strPath
        }
        return nodePath.join(oldPath, strPath)
    }
    
    return oldPath
}

