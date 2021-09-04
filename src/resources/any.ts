import {apiCallMethod} from "../internal/api";
import {Resource} from "../types";

export const makeResourceOfType = <T extends Resource<any, any, any>>(apiVersion: string, kind: string) => {
    return apiCallMethod<T>(apiVersion.replace("/", ".") + "." + kind);
};
