import { PlopGeneratorConfig } from "node-plop";

type GeneratorsFn = (dirname: string, dirnameConfCli: Record<string, string>) => Partial<PlopGeneratorConfig>

export type Generators=Record<string, GeneratorsFn>
export type GeneratorsConfig = { 
    subGenConf: true, 
    [x: string ] :Generators|true
}  | Generators
