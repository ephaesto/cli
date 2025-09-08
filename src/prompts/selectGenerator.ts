import { select } from "@inquirer/prompts";
import chalk from "chalk";
interface generatorListInfo {
    name: string;
    description: string;
}

interface SelectGeneratorParams {
    message: string , 
    generatorList: generatorListInfo[];
}

export const selectGenerator = ({
    message = 'Please choose a generator' , 
    generatorList
}: SelectGeneratorParams
): Promise<string> & { cancel: () => void } => {
   return select({
        message,
        choices: generatorList.map(({name, description}) => ({
            name: `${name}${chalk.dim(` - ${description}`)}`,
            value: name,
            })),
        theme:{
            prefix: { done: chalk.green.bold('✦') },
            style:{
                answer: (text: string) => {
                    return chalk.cyanBright(text.split(" - ")[0])
                },
                message: (text: string, status: string) => {
                    if(status === 'done'){
                        return chalk.bold('You use generator')
                    }
                    return chalk.bold(text)
                },
            }
        }
    });  

}
