import fs from 'node:fs';
import path from 'node:path';
import { FilePathError } from '../errors/FilePathError';
import { findRoots } from './findRoots';
import { getRoots, setRoots } from '../config/roots';

interface FindConfigParams {
    dirname: string,
    defaultDirname: string,
    nameConfigFile: string,
}

export interface FindConfig<T> {
    dirnameConfig: T | null,
    defaultDirnameConfig: T | null,
    rootConfig: T | null,
}

export const findConfig =  async <T extends Record<string, unknown>>({
    dirname,
    defaultDirname,
    nameConfigFile,
}: FindConfigParams): Promise<FindConfig<T>>  => {

    let nameFile = nameConfigFile

    if(['.ts', '.js'].includes(path.parse(nameConfigFile).ext)){
        nameFile = path.parse(nameConfigFile).name
    }
    
    let dirnameConfig = null;
    let defaultDirnameConfig = null;
    let rootConfig = null;
    if(fs.existsSync(path.join(dirname, `${nameFile}.ts`)) || fs.existsSync(path.join(dirname, `${nameFile}.js`)) ){
        const { default: conf} = await import(path.join(dirname, nameFile));
        dirnameConfig = conf
    }

    if(fs.existsSync(path.join(defaultDirname, `${nameFile}.ts`)) || fs.existsSync(path.join(defaultDirname, `${nameFile}.js`))){
        const { default: conf} = await import(path.join(defaultDirname, nameFile));
        defaultDirnameConfig = conf
    }

    let root = getRoots('~~')
    if(!root){
        const {'~~': currentRoot} = findRoots(true)
        if(currentRoot){
            setRoots({'~~': currentRoot})
        }
        root = currentRoot
    }

    if(root && (fs.existsSync(path.join(root, `${nameFile}.ts`)) || fs.existsSync(path.join(root, `${nameFile}.js`)))){
        const { default: conf,  } = await import(path.join(root, nameFile));
        rootConfig = conf
    }

    if(dirnameConfig || defaultDirnameConfig || rootConfig){
        return {
            dirnameConfig,
            defaultDirnameConfig,
            rootConfig,
        }
    }

    throw new FilePathError(`The file "${nameConfigFile}" does not exist.`)
}