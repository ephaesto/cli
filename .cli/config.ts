import { CmdConfig } from "../src/entities/CmdConfig";
import { cmdGen } from "../src/cmd/cmfGen";
import { cmdInit } from "../src/cmd/cmdInit";
import { cmdNew } from "../src/cmd/cmdNew";
import { cmdTest } from "../src/cmd/cmdTest";
import { copy } from "../src/plop/actions/copy";
import { addFolder } from "../src/plop/actions/addFolder";

 const config: CmdConfig = {
    name: 'grim',
    configFile: 'config.cli.json',
    cliFolder: '.cli',
    rootKey: 'root',
    dirnamesKey: 'dirnames',
    description:'CLI to some JavaScript string utilities',
    version:'0.0.0',
    command: {
        init:{ cmdFn:cmdInit, plop: 'init.plopfile.ts', config: 'generators'},
        test:{ cmdFn:cmdTest, plop: 'test.plopfile.ts', config: 'generators'},
        new: { cmdFn:cmdNew, plop: 'plopfile.ts', config: 'generators'},
        gen: { cmdFn:cmdGen, plop: 'plopfile.ts', config: 'generators'},
    },
    actions: {
        copy,
        addFolder,
    }
}

export default config;