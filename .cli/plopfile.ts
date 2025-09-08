import type { NodePlopAPI } from 'plop'
import { getGenerators } from '../src/config/generators';
import setup from '../src/plop/setup';
import { findDirnames } from '../src/plop/findDirnames';

export default async function (plop: NodePlopAPI) {
  setup(plop)
  
  const generators = getGenerators()
  const { dirname, dirnames} = findDirnames()

  for( const [name, GeneratorFn] of Object.entries(generators)){
    if(name && GeneratorFn){
      plop.setGenerator(name, GeneratorFn(dirname, dirnames))
    }
  }
}

