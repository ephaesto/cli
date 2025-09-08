import { GenObject } from '../../entities/GenObject';
import { filePlop } from './filePlop';

interface DeepFilePlopParams {
    argsList:(string | GenObject)[], 
    configPath: string;
    force?:boolean;
    deep?:boolean;
    dest?:string;
    ignoreDest?: boolean;
}
export const deepFilePlop = async ({
    argsList, 
    configPath, 
    force = false, 
    dest = process.cwd(), 
    ignoreDest = false 
}: DeepFilePlopParams ):  Promise<boolean> => {
    for (const args of argsList) {
        const {argsList: childArgsList, dest:childDest} = await filePlop({ args, configPath, force, oldDest: dest, ignoreDest})
        await deepFilePlop({argsList: childArgsList, configPath, force, dest:childDest})
    }
    return true
}