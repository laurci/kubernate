---
layout: default
title: Kubernetes CRDs
nav_order: 9
---

## Kubernetes CRDs

Kubernate supports resources that are not defined in the Kubernetes API but specified using a custom resource definition (CRD). Is generates all the glue code needed to use the CRD. The only requirement is a pointer to the CRD definition (as yaml, not as a resource in a cluster).

You can configure the CRD generator to generate a CRD for a specific group. You can follow [this](/basics/kubernaterc.html#crds-generation) guide on the configuration.

Every time the CRDs change you must run the `kubernate generate` command to regenerate the code. More info on the [`kubernate generate`](/commands/generate) command.

The output can be used as following:

```typescript
import crds from "./generated/crds";

crds.elastic.elasticsearch.v1.Elasticsearch({
    metadata: {
        name: "elastic",
    },
    spec: {
        version: "7.14",
        nodeSets: [
            {
                name: "default",
                count: 1,
                config: {
                    "node.store.allow_mmap": false,
                },
            },
        ],
    },
});
```

The YAML output of this example is:

```yaml
apiVersion: elasticsearch.k8s.elastic.co/v1
kind: Elasticsearch
metadata:
    name: elastic
spec:
    version: "7.14"
    nodeSets:
        - name: default
          count: 1
          config:
              node.store.allow_mmap: false
```

The used configuration is the following:

```yaml
crds:
    output: ./src/generated/crds
    list:
        - groupPrefix: k8s.elastic.co
          name: elastic
          path: crds/elastic.yaml
```
