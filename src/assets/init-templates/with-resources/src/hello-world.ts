import kube, {output} from "kubernate";

/**
 * Kubernate comes with some pre-built resource helpers for most common resources.
 * check imports from "kubernate/resources/*"
 */
import namespace from "kubernate/resources/namespace";

import * as path from "path";
import resources from "./generated";

const outputPath = (fileName: string) => path.join(__dirname, "../output", fileName);

/**
 * This is the main entry point and will be called by Kubernate.
 */
export default async () => {
    // get all resources of demo/v1/HelloWorld
    const helloWorldServices = resources("demo/v1/HelloWorld", "*/*");

    for (let helloWorldService of helloWorldServices) {
        // carete a new namespace
        const ns = namespace(`hello-world-${helloWorldService.metadata.name}`);

        // create and reuse this selector
        const selector = {
            app: `hello-world-${helloWorldService.metadata.name}`,
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
                            env: [
                                {
                                    name: "WHO",
                                    value: helloWorldService.spec.who,
                                },
                            ],
                        },
                    ],
                },
            },
        });

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
    }
    // write the output to disk
    await output.bundleToDisk(outputPath("hello-world.yaml"));
};
