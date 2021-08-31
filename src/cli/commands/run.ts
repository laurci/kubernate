import type Yargs from "yargs";
import * as path from "path";
import {makeLogger} from "../../log";
import config from "../config";

const log = makeLogger("run", {
    displayFunctionName: false,
});

export const runCommand = (name: string) => (yargs: typeof Yargs) => {
    return yargs.command(
        name,
        `Runs the ${name} script from your project`,
        (args) => args,
        async (args) => {
            log.info("running", name);
            log.debug("loading", config.scripts![name]);
            require("ts-node/register/transpile-only");
            try {
                const script = require(path.join(config.root, config.scripts![name]));
                log.debug("loaded", config.scripts![name]);
                script.default().catch((ex: any) => {
                    console.error(ex);
                });
            } catch (ex) {
                log.error("Failed to execute " + name, ex);
                process.exit(1);
            }
        }
    );
};
