import { select } from "@inquirer/prompts";
import chalk from "chalk";

interface SelectTypeGenParams {
    message: string , 
    typeGenList: string[];
}

export const selectTypeGen = ({
    message = 'Please choose a type of generator list' , 
    typeGenList
}: SelectTypeGenParams
): Promise<string> & { cancel: () => void } => {
   return select({
        message,
        choices: typeGenList.map(name => ({
            name: name,
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
                        return "You use type"
                    }
                    return chalk.bold(text)
                },
            }
        }
    });  

}
