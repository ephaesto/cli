import fs from 'node:fs';
import path from 'node:path';
import { FilePathError } from '../errors/FilePathError';

interface FindPlopPath {
    dirname: string,
    defaultDirname: string,
    namePlopFile: string,
}

export const findPlopPath = ({dirname, defaultDirname, namePlopFile}: FindPlopPath) => {
    if(fs.existsSync(path.join(dirname, namePlopFile))){
        return path.join(dirname, namePlopFile)
    }

    if(fs.existsSync(path.join(defaultDirname, namePlopFile))){
        return path.join(defaultDirname, namePlopFile)
    }

    throw new FilePathError(`The file "${namePlopFile}" does not exist.`)
}