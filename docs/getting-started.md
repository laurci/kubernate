---
layout: default
title: Getting started
nav_order: 2
---

## Getting started

### Prerequisites

You must have installed Node.js (14.x or later) and npm. Yarn can be used instead of npm.

Kubernate only supports VSCode for code completion in YAML files. It's recommended to use VSCode, but not required.

### Installation

```bash
npm install -g kubernate
```

Done :).

Yarn may also be used. Kubernate has to be installed globally for code completion ([here](/setup) is how to setup that) to work and to be able to use the `kubernate init` command, for everything else, the binary that is shipped with the library can be used.

### Creating a Kubernate project

You may use the `kubernate init` ([more info here](/commands/init)) command to create a Kubernate project.

```bash
kubernate init my-first-project
```

### Explore the created project

Let's take a look at `src/hello-world.ts` and break it down.

The first import is from the Kubernate library.

```typescript
import kube, {output} from "kubernate";
```

The default import `kube` gives you access to the Kubernetes resources that come with the library. You will see how this gets used soon. The named import `output` is used to output the generated Kubernetes YAML (to disk or in memory, both are possible).

```typescript
/**
 * Kubernate comes with some pre-built resource helpers for most common resources.
 * check imports from "kubernate/resources/*"
 */
import namespace from "kubernate/resources/namespace";
```

This next import statement is for the `namespace` resource helpers, like the comment says. Kubernate comes with a few pre-built resource helpers, but you can also create your own. These are just utility functions that help you create Kubernetes resources easily.

```typescript
/**
 * This is the main entry point and will be called by Kubernate.
 */
export default async () => {
    //....
};
```

Every Kubernate script needs to have a default export, which is the main function (must be **async**) that Kubernate will run. The whole program is contained in this function (you can call external functions from here, even from different files).

Let's take a look inside this function.

```typescript
// carete a new namespace
const ns = namespace("hello-world");
```

This is how the `namespace` helper can be used to easily create a Kubernetes namespace. The return value is the name of the namespace.

```typescript
// create and reuse this selector
const selector = {
    app: "hello-world",
};

// create a pod template for out deployment
const pod = kube.core.v1.PodTemplate({
    template: {
        metadata: {
            namespace: ns,
            name: "hello-world",
            labels: selector,
        },
        spec: {
            containers: [
                {
                    name: "hello-world-http",
                    image: "kornkitti/express-hello-world:latest",
                    imagePullPolicy: "Always",
                    ports: [
                        {
                            containerPort: 8080,
                            name: "http",
                        },
                    ],
                },
            ],
        },
    },
});
```

This is how you can create a pod template. The `pod` variable is the pod template. It gets created by calling `kube.core.v1.PodTemplate`. Every Kubernate resource is fully typed. Try to type `kube` and then press `.` and see whats available. You can also press `ctrl + spacebar` to checkout the intellisense for the input objects.

```typescript
// create a deployment using our pod template
kube.apps.v1.Deployment({
    metadata: {
        namespace: ns,
        name: "hello-world",
    },
    spec: {
        replicas: 1,
        selector: {
            matchLabels: selector,
        },
        template: pod.template!,
    },
});
```

Similar to the `pod` template, we can create a deployment using the `kube.apps.v1.Deployment`. The `pod` template is passed to the `template` property of the `spec` object. Here you can see we also reuse the `selector` defined above.

```typescript
// write the output to disk
await output.bundleToDisk(outputPath("hello-world.yaml"));
```

The last step is to write the Kubernetes YAML to disk. This is done by calling `output.bundleToDisk`. The `outputPath` helper is used to create the path to the file and is defined above.

```typescript
import * as path from "path";

const outputPath = (fileName: string) => path.join(__dirname, "../output", fileName);
```

That's it! You can now run this Kubernate script by running `kubernate hello-world`, then checkout the output file at `output/hello-world.yaml`. It should look like this:

```yaml
apiVersion: v1
kind: Namespace
metadata:
    name: hello-world
---
apiVersion: apps/v1
kind: Deployment
metadata:
    namespace: hello-world
    name: hello-world
spec:
    replicas: 1
    selector:
        matchLabels: &a1
            app: hello-world
    template:
        metadata:
            namespace: hello-world
            name: hello-world
            labels: *a1
        spec:
            containers:
                - name: hello-world-http
                  image: kornkitti/express-hello-world:latest
                  imagePullPolicy: Always
                  ports:
                      - containerPort: 8080
                        name: http
```

### The finish line

You did it! That was easy, wasn't it? You can continue by reading some of the basics [here](/basics).
