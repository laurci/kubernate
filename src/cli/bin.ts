#!/usr/bin/env node

import yargs from "yargs";
import {generateCommand} from "./commands/generate";

const commands = [generateCommand];

const args = commands.reduce((arg, command) => command(arg), yargs);

args.help().strict().demandCommand().showHelpOnFail(true).argv;
