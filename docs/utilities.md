---
layout: default
title: Utilities
nav_order: 10
---

## Utilities

Kubernate provides some utilities that you can use in your script to make your life easier.

### makeLogger(options: LoggerOptions): Logger

`makeLogger` can be used to create a logger that will log to the console with a similar look with Kubernate itself. The log level can be set using the options provided to `makeLogger` or by setting the `LOG_LEVEL` environment variable. The accepted log levels are: `silly`, `trace`, `debug`, `info`, `warn`, `error`, `fatal`.

```typescript
import {makeLogger} from "kubernate";

const log = makeLogger("hello-world", {
    displayFunctionName: false,
    // more options here ....
});

log.silly("hi", {a: [1, 2]});
log.trace("hi", {a: [1, 2]});
log.debug("hi", {a: [1, 2]});
log.info("hi", {a: [1, 2]});
log.warn("hi", {a: [1, 2]});
log.error("hi", {a: [1, 2]});
log.fatal("hi", {a: [1, 2]});
```

### Definition<T>

The `Definition` generic can be used to retreive a type definition from the name of the type. This is useful when you want to pass parameters or return values between functions and you want them to be typed.

```typescript
import {Definition} from "kubernate";

type x = Definition<"core.v1.ConfigMap">;
```

### isResourceOfType(resource: any, type: TAllTypes): resource is type

`isResourceOfType` is a type guard that can be used to check if a resource is of a certain type. This is very useful when developing transformers that need to know if a resource is of a certain type.

```typescript
output.bundleToDisk("hello-world.yaml", {
    transformers: [
        // here resource if of type any
        (resource) => {
            // this type guard ensures that resource is of type core.v1.Service
            if (isResourceOfType(resource, "core.v1.Service")) {
                // resource is of type core.v1.Service here
                // apply transformation here ...
            }
            return resource;
        },
    ],
});
```

### patchResource(source: T, patch: DeepPartial<T>): T and strategicPatchResource(source: T, patch: DeepPartial<T>): T

Both `strategicPatchResource` and `patchResource` can be used to patch a resource. The difference is that `strategicPatchResource` will attempt to merge arrays and `patchResource` will replace them.

```typescript
strategicPatchResource(resource, {
    metadata: {
        annotations: {
            "kubernate.dev/hello-world-service": "true",
        },
    },
});
```
