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
    scripts?: {
        [name: string]: string;
    };
    resources?: {
        entryTypeName?: string;
        include?: string;
        exclude?: string[];
        output: ConfigOutputs;
        entry: string;
        contributors?: string[];
    };
}

const configLoader = cosmiconfigSync("kubernate").search();

const config = {
    root: !!configLoader?.filepath ? path.dirname(configLoader?.filepath ?? "") : "not_found",
    filePath: configLoader?.filepath,
    ...(configLoader?.config ?? {}),
} as Config & {
    filePath: string;
    root: string;
};
export default config;
