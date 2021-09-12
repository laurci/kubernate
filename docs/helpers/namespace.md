---
layout: default
title: Namespace
nav_order: 2
parent: Helper resources
---

## The **`namespace`** resource

The `namespace` resource helper is a utility for creating namespaces. It wraps a call to `kube.core.v1.Namespace(.....)`.

Usage:

```typescript
import namespace from "kubernate/resources/namespace";

const ns = namespace("abcd"); // ns will have the value of "abcd"
```

It receives a second optional paramater with extra kubernate options.
