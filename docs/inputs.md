---
layout: default
title: Inputs
nav_order: 8
---

## Inputs (Kubernate Resources)

Kubernate resources are similar to CRDs but are not stored in the Kubernetes API. Instead they are parsed at build time and can be used to emit real Kubernetes resources.

For example, someone could declare a `WebService` resource that can then be used to create a `Deployment`, `Service`, and `Ingress` resource for every `WebService`. This is a very powerful way to provide configuration to your Kubernate script. Kubernate Resources (called just resources in this document) have a similar structure to the Kubernetes Resources:

-   they contain type identification via the `apiVersion` and `kind` fields
-   they contain a `metadata` section that has by default a `name`, a `namespace` and `annotations`, but can be extended for each resource independently.
-   they contain a `spec` section that contains the actual configuration for the resource.

In the following example a `HelloWorld` resource is defined:

```typescript
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
```

As you can see, both the spec and the resource are just defined as interfaces. The `Resource` generic receives the following type parameters:

-   `apiVersion`: the API version of the resource.
-   `kind`: the kind of the resource.
-   `spec`: the spec of the resource.
-   `metadata`: the metadata of the resource. if this is not provided, the default implementation is used.

All the resources in a project must be bundled into a single union type that can be used by the Kubernate CLI to identify the resources that are available for generation.

An example of this type could be:

```typescript
import {HelloWorldService} from "./hello-world-service";

/**
 * This is a union type (A | B) of all the resources that you want to use.
 */
export type Resources = HelloWorldService;
```

The configuration for the resources generation is explained in detail in [this](/basics/kubernaterc.html#crds-generation) guide on the configuration. The command used for generation is `kubernate generate` (more info [here](/commands/generate.html)). This command must be run every time you change the resources definition.

The resources can be specified as YAML files inside your project. For example, a definition of our `HelloWorld` resource might look like so:

```yaml
# you have intellisense here. give it a try :)
apiVersion: demo/v1
kind: HelloWorld
metadata:
    name: hello-test1
spec:
    who: world1
---
apiVersion: demo/v1
kind: HelloWorld
metadata:
    name: hello-test2
spec:
    who: world2
```

To query the resources from your Kubernate script, you can use the generated `resources` function. This function accepts two parameters: the type of the resources you want to query and an expression that will be used to filter the resources (the format is `namespace/name`; you can use Globs; the default is `**` and matches all namespaces and names). Here is an example of using this method:

```typescript
import kube from "kubernate";

// import the generated resources function
import resources from "./generated";

// get all resources of demo/v1/HelloWorld
const helloWorldServices = resources("demo/v1/HelloWorld", "*/*");

for (let helloWorldService of helloWorldServices) {
    // carete a new namespace for each resource
    kube.core.v1.Namespace({
        name: `hello-world-${helloWorldService.metadata.name}`,
    });

    // do more here....
}
```

To setup intellisense for the your resource, you must have installed the YAML extension for VS Code (only VS Code is officially supported at this time) and configure it properly to point to the schemas of your project. If you initialize your project with `kubernate init`, the extension will be recommended and configured for you.

An example `.vscode/settings.json` might look like this (adapt to your own configuration):

```json
{
    "yaml.schemas": {
        "node_modules/kubernate/schemas/config.json": ".kubernaterc.yaml",
        "schemas/resources.json": "input/**.yaml"
    }
}
```
