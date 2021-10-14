import type Yargs from "yargs";
import {makeLogger} from "../../log";
import config, {Config} from "../config";
import * as path from "path";
import * as fs from "fs";
import glob from "glob";
import handlebars from "handlebars";
import {exec, cd} from "shelljs";

const log = makeLogger("init", {
    displayFunctionName: false,
});

export const initCommand = (yargs: typeof Yargs) => {
    return yargs.command(
        "init <name>",
        "start a new project with kubernate",
        (args) =>
            args
                .positional("name", {required: true, type: "string", description: "the name of the project"})
                .option("path", {
                    type: "string",
                    description: "the path to the project (defaults to the $CWd/name)",
                    alias: "p",
                    required: false,
                })
                .option("template", {
                    alias: "t",
                    description: "the name of the source template",
                    type: "string",
                    choices: ["basic", "with-resources", "blank"],
                    default: "basic",
                    required: true,
                })
                .option("package-manager", {
                    alias: "m",
                    default: "npm",
                    description: "the package manager to use",
                    choices: ["npm", "yarn"],
                }),
        async (args) => {
            const projectName = args.name!;
            const projectPath = path.join(process.cwd(), args.path ?? projectName);
            const porjectTemplate = args.template ?? "basic";
            const projectPackageManager = args["package-manager"] ?? "npm";

            log.info(`creating kubernate project ${projectName} at ${projectPath}`);

            if (fs.existsSync(projectPath)) {
                if (!fs.statSync(projectPath).isDirectory()) {
                    log.error(`${projectPath} exists and is not a directory`);
                    process.exit(1);
                }

                const contents = fs.readdirSync(projectPath);
                if (contents.length > 0) {
                    log.error(`directory ${projectPath} already exists and is not empty`);
                    process.exit(1);
                }
            } else {
                log.debug(`creating directory ${projectPath}`);
                fs.mkdirSync(projectPath, {recursive: true});
            }

            const templateDirectory = path.join(__dirname, "../../", "assets", "init-templates", porjectTemplate);

            if (!fs.existsSync(templateDirectory)) {
                log.error(`template ${porjectTemplate} does not exist`);
                process.exit(1);
            }

            const templateFiles = glob.sync("**/*", {cwd: templateDirectory, dot: true, nodir: true});

            for (let file of templateFiles) {
                let fileName = file.replace(".hbs", "");
                if (fileName.includes("{{")) {
                    fileName = handlebars.compile(file.replace(".hbs", ""))({
                        projectName,
                        projectPath,
                        porjectTemplate,
                        projectPackageManager,
                    });
                }

                const content = file.endsWith(".hbs")
                    ? handlebars.compile(fs.readFileSync(path.join(templateDirectory, file), "utf8"))({
                          projectName,
                          projectPath,
                          porjectTemplate,
                          projectPackageManager,
                      })
                    : fs.readFileSync(path.join(templateDirectory, file), "utf8");

                const directory = path.dirname(path.join(projectPath, fileName));

                if (!fs.existsSync(directory)) {
                    log.debug(`creating directory ${directory}`);
                    fs.mkdirSync(directory, {recursive: true});
                }

                if (!file.endsWith(".empty")) {
                    log.debug(`writing file ${file} as ${fileName}`);
                    fs.writeFileSync(path.join(projectPath, fileName), content);
                }
            }

            cd(projectPath);
            log.info(`$ ${projectPackageManager} install`);
            exec(`${projectPackageManager} install`);

            log.info(`project ${projectName} created at ${projectPath}`);
            log.info(`now run 'cd ${args.path ?? projectName}'`);
        }
    );
};
