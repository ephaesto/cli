import merge from "lodash.merge"
import { Generators, GeneratorsConfig } from "../../entities/Generators"
import { FindConfig } from "../../path/findConfig"

export const mergeGeneratorConfig = ({dirnameConfig, defaultDirnameConfig, rootConfig}: FindConfig<GeneratorsConfig>): GeneratorsConfig => {
    const oneIsMulti = dirnameConfig?.subGenConf || defaultDirnameConfig?.subGenConf || rootConfig?.subGenConf
    let dirnameGenConfig = dirnameConfig || {}
    let defaultDirnameGenConfig = defaultDirnameConfig || {}
    let rootGenConfig = rootConfig || {}

    if(oneIsMulti && !dirnameGenConfig.subGenConf && Object.values(dirnameGenConfig).length ){
        dirnameGenConfig = { subGenConf: true , default: dirnameGenConfig as  Generators}
    }
    if(oneIsMulti && !defaultDirnameGenConfig.subGenConf && Object.values(defaultDirnameGenConfig).length ){
        defaultDirnameGenConfig = { subGenConf: true , default: defaultDirnameGenConfig as  Generators}
    }
    if(oneIsMulti && !rootGenConfig.subGenConf && Object.values(rootGenConfig).length ){
        rootGenConfig = { subGenConf: true , default: rootGenConfig as  Generators}
    }

    return merge(merge(defaultDirnameGenConfig,dirnameGenConfig),rootGenConfig)
}