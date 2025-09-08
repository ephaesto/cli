#!/usr/bin/env tsx

import { fileURLToPath } from "node:url";
import startCli from "../src/startCli";
import path from "path";
import config from "../.cli/config";

const __dirFolderCli = path.join(path.dirname(fileURLToPath(import.meta.url)), `../${config.cliFolder}`);
startCli(config, __dirFolderCli )



