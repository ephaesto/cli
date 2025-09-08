import { Command } from "commander";

const findOptions = (command: any): string[] => {
    const options = command.options
    options.push(command._helpOption)
    return options.flatMap(({flags}) => flags.replace(/(<[^>]+>)/g, '').trim().split(', '));
  }
  
  const sanitizeArgs = (rawArgs: string[], options: string[]): Record<string, string> => {
    const args =[ ...rawArgs]
    options.forEach((option) => {
      const optionExist = args.indexOf(option)
      if(optionExist!== -1){
        let nextOptionIndex = args.findIndex((el, i) => i > optionExist && el.startsWith("--"));
        if (nextOptionIndex === -1) {
          args.splice(optionExist, 1);
        } else {
          args.splice(optionExist, nextOptionIndex - optionExist);
        }
      }
    })
    const cleanArgs = args.reduce<Record<string, string>>((acc, arg, index, oldArgs) => {
      if(arg.startsWith("--")&& oldArgs[index+1] && !oldArgs[index+1].startsWith("--")){
        acc[arg.replace(/^--/, '')] = oldArgs[index+1];
      }
      return acc
    }, {})
    return cleanArgs 
  }
  
 export  const finSkippedParams = (program: Command, command?: any): Record<string, string> => {
    const rawArgs = program.parseOptions(process.argv).unknown;
    const separatorIndex = rawArgs.indexOf('--');
    const rawArgsSkipped = separatorIndex !== -1
    ? rawArgs.slice(separatorIndex + 1)
    : rawArgs
  
    const options = findOptions(command)
    return sanitizeArgs(rawArgsSkipped, options)
  }