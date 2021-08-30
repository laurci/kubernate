import {makeLogger} from "../log";
import cache, {ResourcesBundle} from "../output/cache";

export type ApiCallOptions = {bundle?: ResourcesBundle};
export type ApiCallMethod<T> = (input: Omit<T, "apiVersion" | "kind" | "status">, options?: ApiCallOptions) => Omit<T, "status">;

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

        if (!apiName.toLowerCase().includes("template")) {
            (options?.bundle ?? cache).addResource(resource);
        }
        return resource;
    }.bind({});
};
