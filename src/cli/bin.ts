#!/usr/bin/env node

import yargs from "yargs";
import config from "./config";
import {generateCommand} from "./commands/generate";
import {runCommand} from "./commands/run";

const commands = [generateCommand, ...Object.keys(config.scripts ?? {}).map((name) => runCommand(name))];

const args = commands.reduce((arg, command) => command(arg), yargs);

args.help().completion().strict().demandCommand().showHelpOnFail(true).argv;
