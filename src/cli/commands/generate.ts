import type Yargs from "yargs";
import * as fs from "fs";
import * as path from "path";
import {Project, InterfaceDeclaration, SourceFile} from "ts-morph";
import * as TJS from "typescript-json-schema";
import {makeLogger} from "../../log";
import config, {Config} from "../config";

const log = makeLogger("generate", {
    displayFunctionName: false,
});

type ResourcesMeta = Config["resources"] & {
    absoluteOutputs: {
        code: string;
        schemas: {
            main: string;
            objects: string;
        };
    };
};

function findEntryTypeName(sourceFile: SourceFile): string {
    const types = sourceFile.getTypeAliases();
    for (let t of types) {
        if (t.isExported() && t.getType().isUnion()) {
            return t.getName();
        }
    }
    throw new Error("No exported union type alias found");
}

export const generateCommand = (yargs: typeof Yargs) => {
    return yargs.command(
        "generate",
        "Run the generation procedure for the schemas",
        (args) => args,
        async (args) => {
            if (!config.resources) {
                log.error("No resources configured");
                process.exit(1);
            }

            const sourcePath = path.join(config.root, config.resources.entry);
            log.info("opening", sourcePath, "as entry file");

            const project = new Project({});
            const mainSource = project.addSourceFileAtPath(sourcePath);
            const dependencies = project.resolveSourceFileDependencies();

            const dependenciesMap: {[key: string]: InterfaceDeclaration} = {};

            const typeAliasName = config.resources?.entryTypeName ?? findEntryTypeName(mainSource);

            log.info("Using exported type", typeAliasName);

            const mainType = mainSource.getTypeAliasOrThrow(typeAliasName).getType();

            const declaredServices = (
                mainType.isUnion()
                    ? mainType
                          .getUnionTypes()
                          .map((x) => ({
                              name: x.getSymbol()?.getName() ?? x.getAliasSymbol()?.getName(),
                              typeArgs: x
                                  .getBaseTypes()
                                  .map((x) =>
                                      x
                                          .getAliasTypeArguments()
                                          .filter((x) => x.isStringLiteral())
                                          .map((x) => x.getLiteralValue())
                                  )
                                  .reduce((prev, cur) => [...prev, ...cur], []),
                          }))
                          .filter((x) => !!x && x.name !== "__type")
                    : [
                          {
                              name: mainType.getSymbolOrThrow().getName(),
                              typeArgs: mainType
                                  .getBaseTypes()
                                  .map((x) =>
                                      x
                                          .getAliasTypeArguments()
                                          .filter((x) => x.isStringLiteral())
                                          .map((x) => x.getLiteralValue())
                                  )
                                  .reduce((prev, cur) => [...prev, ...cur], []),
                          },
                      ]
            ) as {name: string; typeArgs: string[]}[];

            for (let dependency of dependencies) {
                const interfaces = dependency.getInterfaces().filter((x) => !!declaredServices.find((s) => s.name == x.getName()));
                for (let intf of interfaces) {
                    dependenciesMap[intf.getName()] = intf;
                }
            }

            log.debug("generating program");
            const program = TJS.getProgramFromFiles(project.getSourceFiles().map((x) => x.getFilePath()));

            log.debug("generating schema");
            let schema = TJS.generateSchema(program, typeAliasName, {
                excludePrivate: true,
                propOrder: true,
                ignoreErrors: true,
                required: true,
            });

            if (typeof schema?.anyOf !== "undefined") {
                schema.oneOf = schema.anyOf;
                delete schema.anyOf;
            }

            const schemaOutputPath = path.join(config.root, config.resources.output.schemas, "objects.json");
            const schemaStubOutputPath = path.join(config.root, config.resources.output.schemas, "resources.json");

            if (!fs.existsSync(path.dirname(schemaOutputPath))) {
                log.debug("creating directory", path.dirname(schemaOutputPath));
                fs.mkdirSync(path.dirname(schemaOutputPath), {recursive: true});
            }

            const contributorsMeta = (config.resources.contributors ?? []).map((x) => {
                try {
                    const modulePath = path.join(
                        path.dirname(
                            fs.existsSync(path.join(config.root, x))
                                ? path.join(config.root, x, ".kubernate/resources.meta")
                                : require.resolve(x + "/.kubernate/resources.meta", {paths: [config.root]})
                        ),
                        "../"
                    );

                    if (!fs.existsSync(modulePath)) {
                        log.fatal("Could not load contributor", x);
                        process.exit(1);
                    }

                    const metaPath = path.join(modulePath, ".kubernate", "resources.meta");
                    if (!fs.existsSync(metaPath)) {
                        log.fatal(x, "is not a valid contributor!", metaPath, "is missing");
                        process.exit(1);
                    }

                    return {
                        meta: JSON.parse(fs.readFileSync(metaPath, "utf8")) as ResourcesMeta,
                        root: path.dirname(modulePath),
                        filePath: metaPath,
                        relativeToRoot: path.relative(path.dirname(schemaOutputPath), modulePath),
                    };
                } catch (ex) {
                    log.fatal("Could not load contributor", x);
                    process.exit(1);
                }
            });

            log.info("writing schema to", schemaStubOutputPath);
            fs.writeFileSync(schemaOutputPath, JSON.stringify(schema, null, 4));
            fs.writeFileSync(
                schemaStubOutputPath,
                JSON.stringify(
                    {
                        $schema: "http://json-schema.org/draft-07/schema#",
                        oneOf: [
                            {
                                $ref: "objects.json",
                            },
                            ...contributorsMeta.map((x) => ({$ref: path.join(x.relativeToRoot, x.meta.absoluteOutputs.schemas.main)})),
                        ],
                    },
                    null,
                    4
                )
            );

            const outputSourceFile = project.createSourceFile(path.join(config.root, config.resources.output.code, "declarations.ts"), "", {
                overwrite: true,
            });
            for (let serviceSpec of declaredServices) {
                const serviceInterface = dependenciesMap[serviceSpec.name];
                outputSourceFile.addImportDeclaration({
                    moduleSpecifier: outputSourceFile.getRelativePathAsModuleSpecifierTo(serviceInterface.getSourceFile().getFilePath()),
                    namedImports: [serviceSpec.name],
                });
            }

            if (!fs.existsSync(path.dirname(outputSourceFile.getFilePath()))) {
                log.debug("creating directory", path.dirname(outputSourceFile.getFilePath()));
                fs.mkdirSync(path.dirname(outputSourceFile.getFilePath()), {recursive: true});
            }

            fs.writeFileSync(
                outputSourceFile.getFilePath(),
                `
/**
 * This file was generated by kubernate.
 * Do not edit this file manually. Any changes will be overwritten.
 */
${outputSourceFile.getText()}

export type DeclaredServicesMap = {
${declaredServices.map((x) => `\t"${x.typeArgs.join("/")}": ${x.name}`).join(",\n")}
};
`
            );

            fs.writeFileSync(
                path.join(config.root, config.resources.output.code, "index.ts"),
                `
/**
 * This file was generated by kubernate.
 * Do not edit this file manually. Any changes will be overwritten.
 */
import {makeResourcesBrowser} from "kubernate/internal/api";
import {join as pathJoin} from "path";
import {DeclaredServicesMap} from "./declarations";

const resources = makeResourcesBrowser<DeclaredServicesMap>(pathJoin(__dirname, "${path.relative(
                    path.dirname(path.join(config.root, config.resources.output.code, "index.ts")),
                    config.root
                )}"));
export default resources;
`
            );

            const metadataOutputPath = path.join(config.root, ".kubernate", "resources.meta");

            if (!fs.existsSync(path.dirname(metadataOutputPath))) {
                log.debug("creating directory", path.dirname(metadataOutputPath));
                fs.mkdirSync(path.dirname(metadataOutputPath), {recursive: true});
            }

            fs.writeFileSync(
                metadataOutputPath,
                JSON.stringify(
                    {
                        ...config.resources,
                        absoluteOutputs: {
                            code: outputSourceFile.getFilePath().replace(config.root, "."),
                            schemas: {
                                main: schemaStubOutputPath.replace(config.root, "."),
                                objects: schemaOutputPath.replace(config.root, "."),
                            },
                        },
                    } as ResourcesMeta,
                    null,
                    4
                )
            );
        }
    );
};
