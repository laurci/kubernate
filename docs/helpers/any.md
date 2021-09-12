---
layout: default
title: Any
nav_order: 3
parent: Helper resources
---

## The **`any`** resource

The `any` resource is not a real resource, but it is a helper resource that can be used to create any resource. It receives the type of the resource you want to create and returns the call method (similar to `kube.*` methods).

Usage:

```typescript
import {makeResourceOfType} from "kubernate/resources/any";

interface MyResource
    extends Resource<
        "kubernate.learn/v1beta1",
        "MyResource",
        {
            counter: number;
        }
    > {}

const myResource = makeResourceOfType<MyResource>("kubernate.learn/v1beta1", "MyResource"); // this creates a `any` resource

const firstResource = myResource({
    metadata: {
        name: "first-custom-resource",
    },
    spec: {
        counter: 1,
    },
});
```

The yaml output of this code is:

```yaml
apiVersion: kubernetes.learn/v1beta1
kind: MyResource
metadata:
    name: first-custom-resource
spec:
    counter: 1
```

This is very useful to create resources that are not yet supported by kubernate.
