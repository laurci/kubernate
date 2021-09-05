#!/usr/bin/env node

import yargs from "yargs";
import config from "./config";
import {generateCommand} from "./commands/generate";
import {runCommand} from "./commands/run";
import {initCommand} from "./commands/init";

const commands =
    config.root == "not_found" ? [initCommand] : [generateCommand, ...Object.keys(config.scripts ?? {}).map((name) => runCommand(name))];

const args = commands.reduce((arg, command) => command(arg), yargs);

args.help().completion().strict().demandCommand().showHelpOnFail(true).argv;
