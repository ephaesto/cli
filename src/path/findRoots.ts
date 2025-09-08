import fs from 'node:fs';
import path from 'node:path';
import { readJson } from '../utils/readJson';
import { Roots } from '../entities/Roots';
import { getGlobalConfig } from '../config/global';
import get from 'lodash.get';


export const findRoots = ( findRoot = false): Roots => {
  let currentDir = process.cwd();
  const filename = getGlobalConfig()?.configFile || 'config.cli.json';
  const roots: Roots = {
    '~': null,
    '~~': null,
  }
  while (true) {
    const filePath = path.join(currentDir, filename);
    
    if (fs.existsSync(filePath)) {
      
      const configCli = readJson(filePath)
      const rootKey = getGlobalConfig()?.rootKey || 'root'
      const root = get(configCli || {}, rootKey,  {})
      if(root){
        roots['~~'] = path.dirname(filePath)
      }
      if(findRoot && roots['~~']){
        return  roots
      }
      roots['~'] = path.dirname(filePath)
      return roots
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }
  
  return roots; 
}
