import { CustomActionFunction } from "node-plop"
import path from "node:path"
import fs from 'node:fs';

export const copy: CustomActionFunction = (answers, config, plop) => {
    
    const src = path.join(plop.getPlopfilePath() , plop.renderString(config.src, answers))
    const dest = path.join(plop.getDestBasePath(), plop.renderString(config.dest, answers))
    
    if(!config.force && fs.existsSync(dest)){
        throw {type:config.type, path: dest, error:'File already exists'}
    }

    const dirname = path.dirname(dest)
    fs.mkdirSync(dirname, {recursive: true})
    fs.copyFileSync(src, dest)
    return dest;
}