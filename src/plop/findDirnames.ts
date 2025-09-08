import path from "path"
import { getGlobalConfig } from "../config/global"
import { readJson } from "../utils/readJson"
import get from "lodash.get"
import { getRoots } from "../config/roots"

export const findDirnames = () => {
    let dirname = ''
    let dirnames = {}
    const root = getRoots('~~')

    if(root){
        const configCli = readJson(path.join(root, getGlobalConfig()?.configFile|| 'config.cli.json'))
        const dirnamesKey = getGlobalConfig()?.dirnamesKey || 'dirnames'
        dirnames = get(configCli || {}, dirnamesKey,  {})
        dirname = path.join(root, `/${getGlobalConfig()?.cliFolder || '.cli'}`)
    }
    return {
        dirname,
        dirnames
    } 
}