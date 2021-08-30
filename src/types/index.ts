import {PartialDeep} from "type-fest";
import deepmerge from "deepmerge";
import {DefinitionsAliasMap} from "../__generated__/definitions";

export type Definition<T extends keyof DefinitionsAliasMap> = DefinitionsAliasMap[T];

export function isResourceOfType<T extends keyof DefinitionsAliasMap>(input: any, type: T): input is DefinitionsAliasMap[T] {
    const [api, version, kind] = type.split(".");
    const apiVersion = api == "core" ? version : `${api}/${version}`;

    return input.apiVersion === apiVersion && input.kind === kind;
}

export function patchResource<T>(input: T, patch: PartialDeep<T>): T {
    return deepmerge<PartialDeep<T>>(input, patch, {
        arrayMerge: (target: any[], source: any[]) => source,
    }) as T;
}

export function strategicPatchResource<T>(input: T, patch: PartialDeep<T>): T {
    return deepmerge<PartialDeep<T>>(input, patch) as T;
}

export type ResourceMetaAnnotations = {[key: string]: any};
export type ResourceMetadata<TAnnotations = ResourceMetaAnnotations> = {
    namespace?: string;
    name: string;
    annotations?: TAnnotations;
};

export type Resource<Version extends string, Kind extends string, Spec, Metadata = ResourceMetadata> = {
    apiVersion: Version;
    kind: Kind;
    metadata: Metadata;
    spec: Spec;
};
