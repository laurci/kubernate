import {definitions} from "../__generated__/_schema";

export type CustomResourceDefinition = definitions["io.k8s.apiextensions-apiserver.pkg.apis.apiextensions.v1.CustomResourceDefinition"];

export function isCrd(obj: any): obj is CustomResourceDefinition {
    return obj.apiVersion.indexOf("apiextensions.k8s.io") == 0 && obj.kind == "CustomResourceDefinition";
}
