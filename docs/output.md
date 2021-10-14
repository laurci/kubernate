---
layout: default
title: Output
nav_order: 9
---

## Output

The `output` module is used to convert the in-memory representation of your resources into text, either in memory or to disk.

The most basic example of using the output module:

```typescript
import output from "kubernate/output";

// this service will go to the default bundle
kube.core.v1.Service({
    metadata: {
        namespace: ns,
        name: "hello-world-app",
    },
    spec: {
        type: "ClusterIP",
        ports: [
            {
                name: "http",
                port: 8080,
            },
        ],
        selector: {
            app: "hello-world",
        },
    },
});

// hello-world.yaml will contain hello-world-app Service declaration
output.bundleToDisk("hello-world.yaml");
```

### Bundles

The output module uses the concept of `bundles` to decide what resources to emit.

A `bundle` is a bucket that keeps a collection of created resources. Some of this resources can be emitted (`Deployment`, `Service`, `Ingress`, etc), others cannot (e.g. `PodTemplate` resources are only used as part of another resource like `Deployment`, `Job`, etc). By default all resources go to a default bundle created automatically by Kubernate, but you can also create new bundles and use them with specific resources. If the `output` module isn't instructed otherwise, it will emit the resources from the default bundle. You can use the default bundle together with other bundles, ot you can skip using the default bundle.

An example where a new bundle is created and used is bellow:

```typescript
import output from "kubernate/output";

// create a new empty bundle
const servicesBundle = output.makeEmptyBundle();

// this service will go to the services bundle
kube.core.v1.Service(
    {
        metadata: {
            namespace: ns,
            name: "hello-world-app",
        },
        spec: {
            type: "ClusterIP",
            ports: [
                {
                    name: "http",
                    port: 8080,
                },
            ],
            selector: {
                app: "hello-world",
            },
        },
    },
    {
        // here you can specify what bundle should be used to store this resource
        bundle: servicesBundle,
    }
);

// the output module receives the services bundle and emits it to disk
output.bundleToDisk("services.yaml", {
    source: servicesBundle,
});
```

A bundle can be reset using `bundle.reset()` method. The default bundle can also be reset using the `output.resetBundle()` method. The reset bundle will be empty and can be reused for further emitting.

### Output transformers

Transformers are functions that get invoked by the `output` module before emitting the resources to text. They receive the resource that will be emited and must return the transformed resource Transformers are really useful for modifying a large number of resources or modifying some resources that follow a certain pattern. Utility functions like `strategicPatchResource` and `patchResource` can be used to modify the resource safely. Assertions can be used to check if the resource matches a desired pattern (`isResourceOfType` is a very useful type guard that can be used in a transformer). Theese utilities are better explained [here](/utilities.html).

The following examples uses a transformer to add an annotation to all Service resources:

```typescript
import {isResourceOfType, strategicPatchResource} from "kubernate";
import output from "kubernate/output";

// .... create resources

output.bundleToDisk("hello-world.yaml", {
    transformers: [
        // here resource if of type any
        (resource) => {
            // this type guard ensures that resource is of type core.v1.Service
            if (isResourceOfType(resource, "core.v1.Service")) {
                // resource is of type core.v1.Service here

                // strategicPatchResource and patchResource are helper functions that can be used to modify the resource
                return strategicPatchResource(resource, {
                    metadata: {
                        annotations: {
                            "kubernate.dev/hello-world-service": "true",
                        },
                    },
                });
            }
            return resource;
        },
    ],
});
```
