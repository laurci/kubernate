import * as path from "path";
import {makeLogger} from "../log";
const log = makeLogger("config", {displayFunctionName: false});

import {cosmiconfig, cosmiconfigSync} from "cosmiconfig";
export interface ConfigOutputs {
    schemas: string;
    code: string;
}

export interface Config {
    targetVersion: "v1";
    resources?: {
        output: ConfigOutputs;
        entry: string;
        contributors?: string[];
    };
}

const configLoader = cosmiconfigSync("kubernate").search();
if (!configLoader || !configLoader.config) {
    log.fatal("Could not load config file!");
    process.exit(1);
}

if (configLoader.isEmpty) {
    log.fatal("Config file is empty");
    process.exit(1);
}

const config = {root: path.dirname(configLoader.filepath), filePath: configLoader.filepath, ...configLoader.config} as Config & {
    filePath: string;
    root: string;
};
export default config;
