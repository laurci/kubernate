import {definitions, DefinitionsMap} from "./__generated__/definitions";
import output from "./output";
import log from "./log";

const kube: DefinitionsMap["api"] = definitions["api"];

export default kube;
export {kube, log, output};

export * from "./types";
export * from "./log";
export * from "./output";
