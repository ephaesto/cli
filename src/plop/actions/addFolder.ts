import { CustomActionFunction } from "node-plop"
import path from "node:path"
import fs from 'node:fs';

export const addFolder: CustomActionFunction = (answers, config, plop) => {
    const dest = path.join(plop.getDestBasePath(), plop.renderString(config.dest, answers))

    if(!config.force && fs.existsSync(dest)){
        throw {type:config.type, path: dest, error:'Folder already exists'}
    }

    fs.mkdirSync(dest, {recursive: true})
    return dest;
}