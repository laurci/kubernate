import {Project} from "ts-morph";
import openapiToTs from "openapi-typescript";
import {join as pathJoin} from "path";
import {writeFileSync} from "fs";

type Method = string | MethodMap;
type MethodMap = {[key: string]: Method};
type DefinitionsAliasMap = {[key: string]: string};

function exit() {
    process.exit(1);
}

function renderIndentation(indentation: number) {
    return Array(indentation).fill("\t").join("");
}

function renderMethodMap(base: string, map: MethodMap, indents: number = 0) {
    const indentation = renderIndentation(indents + 1);
    let text = `${renderIndentation(indents)}${base}: {\n`;
    const methods = Object.keys(map);
    for (let method of methods) {
        if (typeof map[method] == "string") {
            text += `${indentation}${method}: apiCallMethod<defs["${map[method]}"]>("${map[method]}"),\n`;
        } else {
            text += `${renderMethodMap(method, map[method] as MethodMap, indents + 1)}\n`;
        }
    }
    text += `${renderIndentation(indents)}},`;

    return text;
}

function renderMethodMapType(base: string, map: MethodMap, indents: number = 0) {
    const indentation = renderIndentation(indents + 1);
    let text = `${renderIndentation(indents)}${base}: {\n`;
    const methods = Object.keys(map);
    for (let method of methods) {
        if (typeof map[method] == "string") {
            text += `${indentation}${method}: ApiCallMethod<defs["${map[method]}"]>,\n`;
        } else {
            text += `${renderMethodMapType(method, map[method] as MethodMap, indents + 1)}\n`;
        }
    }
    text += `${renderIndentation(indents)}},`;

    return text;
}

function renderDefinitionsAliasMap(map: DefinitionsAliasMap) {
    let text = "";
    const definitions = Object.keys(map);
    for (let definition of definitions) {
        text += `\t"${definition}": ${map[definition]},\n`;
    }
    return text;
}

async function main() {
    const KUBE_VERSION = process.argv.pop();
    console.log("Running generator for Kubernetes version " + KUBE_VERSION);

    const output = await openapiToTs(
        `https://raw.githubusercontent.com/kubernetes/kubernetes/v${KUBE_VERSION}/api/openapi-spec/swagger.json`
    );

    writeFileSync(pathJoin(__dirname, "../__generated__/_schema.ts"), output);

    const project = new Project();
    const source = project.addSourceFileAtPath(pathJoin(__dirname, "../__generated__/_schema.ts"));

    const definitionsInterface = source.getInterface("definitions");

    if (!definitionsInterface) {
        return exit();
    }

    let methodsMap: MethodMap = {};
    let definitionsAliasMap: DefinitionsAliasMap = {};

    for (let definitionProperty of definitionsInterface.getProperties()) {
        const name = JSON.parse(definitionProperty.getName());

        if (!name.includes("io.k8s.api.")) {
            continue;
        }

        definitionsAliasMap[name.replace("io.k8s.api.", "")] = `defs["${name}"]`;

        const methodComponents = name.replace("io.k8s.api.", "").split(".");
        const methodName = methodComponents[methodComponents.length - 1];

        let parts = methodsMap as MethodMap;
        for (let component of methodComponents) {
            if (!parts[component]) {
                if (component == methodName) {
                    parts[component] = name;
                } else {
                    parts[component] = {};
                }
            }

            if (typeof parts[component] == "object") {
                parts = parts[component] as MethodMap;
            }
        }
    }

    writeFileSync(
        pathJoin(__dirname, "../__generated__/definitions.ts"),
        `
import type {definitions as defs} from "./_schema";
import {apiCallMethod, ApiCallMethod} from "../internal/api";

export type DefinitionsAliasMap = {
${renderDefinitionsAliasMap(definitionsAliasMap)}
};

export type DefinitionsMap = {
${renderMethodMapType("api", methodsMap, 1)}
};

export const definitions: DefinitionsMap = {
${renderMethodMap("api", methodsMap, 1)}
};
`
    );
}

main().catch(console.error);
