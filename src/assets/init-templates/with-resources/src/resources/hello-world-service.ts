import {Resource} from "kubernate";

/**
 * This is the spec of our resource.
 */
interface HelloWorldServiceSpec {
    who: string;
}

/**
 * This is how you can declare a resource
 */
export interface HelloWorldService extends Resource<"demo/v1", "HelloWorld", HelloWorldServiceSpec> {}
