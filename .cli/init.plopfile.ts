import type { NodePlopAPI } from 'plop'
import { getGlobalConfig } from '../src/config/global';
import setup from '../src/plop/setup';
import init from './templates/init/init';

export default async function (plop: NodePlopAPI) {
  setup(plop)
  const configFile = getGlobalConfig()?.configFile|| 'config.cli.json'
  const cliFolder = getGlobalConfig()?.cliFolder|| '.cli'
  
  plop.setGenerator('init', init( configFile, cliFolder ))
}

