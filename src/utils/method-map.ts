export type Method = string | MethodMap;
export type MethodMap = {[key: string]: Method};
export type AliasMap = {[key: string]: string};

export function renderIndentation(indentation: number) {
    return Array(indentation).fill("  ").join("");
}

export type MethodFormatter = (base: string, method: string, map: MethodMap, aliases?: AliasMap) => string;

export const CRDApiCallFormatter: MethodFormatter = (base, method, map, aliases) =>
    `crdApiCallMethod<defs["${map[method]}"]>("${map[method]}", "${aliases![map[method] as string]}")`;

export const CRDApiTypeFormatter: MethodFormatter = (base, method, map, aliases) => `CRDApiCallMethod<defs["${map[method]}"]>`;

export const DefinitionsApiCallFormatter: MethodFormatter = (base, method, map, aliases) =>
    `apiCallMethod<defs["${map[method]}"]>("${map[method]}")`;

export const DefinitionsApiTypeFormatter: MethodFormatter = (base, method, map, aliases) => `ApiCallMethod<defs["${map[method]}"]>`;

export function renderMethodMap(base: string, formatter: MethodFormatter, map: MethodMap, aliases?: AliasMap, indents: number = 0) {
    const indentation = renderIndentation(indents + 1);
    let text = `${renderIndentation(indents)}"${base}": {\n`;
    const methods = Object.keys(map);
    for (let method of methods) {
        if (typeof map[method] == "string") {
            text += `${indentation}"${method}": ${formatter(base, method, map, aliases)},\n`;
        } else {
            text += `${renderMethodMap(method, formatter, map[method] as MethodMap, aliases, indents + 1)}\n`;
        }
    }
    text += `${renderIndentation(indents)}},`;

    return text;
}
