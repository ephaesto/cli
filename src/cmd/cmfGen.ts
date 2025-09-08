import path from "path";
import { CmdFn } from "../entities/CmdFn";
import { FilePathError } from "../errors/FilePathError";
import { findAllGenJson } from "../path/findAllGenJson";
import { isGenJson } from "../path/isGenJson";
import { pathConstructor } from "../path/pathConstructor";
import { pathValidating } from "../path/pathValidating";
import { deepFilePlop } from "./utils/deepFilePlop";
import { logError, logger } from "../utils/logger";
import { formatError } from "../utils/formatError";
import { findPlopPath } from "../path/findPlopPath";
import { findConfig } from "../path/findConfig";
import { GeneratorsConfig } from "../entities/Generators";
import { mergeGeneratorConfig } from "./utils/mergeGeneratorConfig";
import { finSkippedParams } from "./utils/finSkippedParams";
import { setGenerators } from "../config/generators";
import { findGenerators } from "./utils/findGenerators";

export const cmdGen: CmdFn = ({program, config, dirname, defaultDirname, stopSpinner}) => {
    program.command('gen')
    .description('Generate elements by file(json)')
    .option('--out <path>', 'Path to generate files')
    .option('--in <path>', 'Path to "gen.json" file or folder')
    .option('-f, --force', 'force overwrites the existing file', false)
    .option('-d, --deep', 'use "genLink" params in ".gen.json"', false)
    .option('-i, --ignore-dest', 'Ignore the "genDest" key by default in the ".gen.json" file.', false)
    .option('-t, --type-gen <path>', 'choice type generators filter')
    .action( async({ typeGen, in: inPath, out: outPath, force, deep, ignoreDest }) => {
      try {
        const configPath = findPlopPath({dirname, defaultDirname, namePlopFile: config.plop || 'plopfile.ts' })
        const AllGeneratorsConfig = await findConfig<GeneratorsConfig>({dirname, defaultDirname, nameConfigFile: config.config || 'generators' })
        const generatorsConfig = mergeGeneratorConfig(AllGeneratorsConfig)
        stopSpinner();
        const generators = await findGenerators(generatorsConfig, typeGen)
        setGenerators(generators);
        const toGenFiles = await pathConstructor(inPath);
        const { isValidPath, isDirectory,isFile } = await pathValidating(toGenFiles)
        if(isValidPath){
          const argsList: string[] = []
          if(isDirectory){
            const allGenFiles = await findAllGenJson(toGenFiles)
            argsList.push(...allGenFiles)
          } else if(isFile && isGenJson(toGenFiles)){
            argsList.push(toGenFiles)
          }else{
            throw new FilePathError("Only '.gen.json' files are allowed.")
          }
          if(argsList.length){
            const dest =  await pathConstructor(outPath);
            await deepFilePlop({
                  argsList, 
                  configPath,
                  force,
                  deep,
                  dest,
                  ignoreDest,
              })
          }
        }
      } catch (anyError) {
        logger("");
        const error = formatError(anyError)
        logError(error);
        process.exit();
      }
    });
}