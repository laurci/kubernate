import {makeLogger} from "../log";
import cache, {ResourcesBundle} from "../output/cache";
import {glob} from "glob";
import minimatch from "minimatch";
import {parseAllDocuments} from "yaml";
import * as fs from "fs";
import config from "../cli/config";

export type ApiCallOptions = {bundle?: ResourcesBundle; skipBundle?: boolean};
export type ApiCallMethod<T> = (input: Omit<T, "apiVersion" | "kind" | "status">, options?: ApiCallOptions) => Omit<T, "status">;
export type CRDApiCallMethod<T> = (input: T, options?: ApiCallOptions) => T;

export const apiCallMethod = <T>(apiName: string): ApiCallMethod<T> => {
    const logger = makeLogger(apiName.replace("io.k8s.api.", ""));

    return function init(input: T, options?: ApiCallOptions) {
        const metadata = (input as any).metadata ?? {};
        const namespace = metadata.namespace;
        const name = metadata.name;

        logger.debug(namespace, name);
        logger.silly(input);

        const [api, version, kind] = apiName.replace("io.k8s.api.", "").split(".");

        const resource = {apiVersion: (api == "core" ? version : `${api}/${version}`).toLowerCase(), kind, ...input};

        if (!options?.skipBundle) {
            if (options?.skipBundle == false) {
                (options?.bundle ?? cache).addResource(resource);
            } else if (!apiName.toLowerCase().includes("template")) {
                (options?.bundle ?? cache).addResource(resource);
            }
        }

        return resource;
    }.bind({});
};

export const crdApiCallMethod = <T>(alias: string, apiName: string): CRDApiCallMethod<T> => {
    const logger = makeLogger(alias);

    return function init(input: T, options?: ApiCallOptions) {
        const metadata = (input as any).metadata ?? {};
        const namespace = metadata.namespace;
        const name = metadata.name;

        logger.debug(namespace, name);
        logger.silly(input);

        const [apiVersion, kind] = apiName.split("#");
        const resource = {apiVersion, kind, ...input};

        if (!options?.skipBundle) {
            (options?.bundle ?? cache).addResource(resource);
        }

        return resource;
    }.bind({});
};

export type ResourceBrowserInfo = {
    fileInfo: {
        path: string;
    };
};

export const makeResourcesBrowser = <T>(
    rootPath: string
): (<TResources extends keyof T>(resource: TResources, filter?: string) => (T[TResources] & ResourceBrowserInfo)[]) => {
    let resourceCache: {[key: string]: any[]} = {};
    let resources: {content: any; path: string}[] | undefined = undefined;

    return ((resourceType: string, filter: string = "*") => {
        if (!resources) {
            resources = [];

            const resourcePaths = glob.sync(`${rootPath}/${config.resources?.include ?? "**/*.yaml"}`, {
                ignore: (config.resources?.exclude ?? []).map((x) => `${rootPath}/${x}`),
            });

            for (let resourcePath of resourcePaths) {
                const yaml = parseAllDocuments(fs.readFileSync(resourcePath, "utf8"));
                for (let resource of yaml) {
                    resources.push({content: resource.toJSON(), path: resourcePath});
                }
            }
        }

        if (!resourceCache[resourceType]) {
            resourceCache[resourceType] = resources
                .filter((resource) => `${resource.content.apiVersion}/${resource.content.kind}` == resourceType)
                .map((x) => ({...x.content, fileInfo: {path: x.path}}));
        }

        return resourceCache[resourceType].filter((x) =>
            minimatch(`${x.metadata?.namespace ?? "default"}/${x.metadata?.name ?? "default"}`, filter)
        );
    }) as any;
};
