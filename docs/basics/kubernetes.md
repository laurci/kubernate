---
layout: default
title: Kubernetes resources
nav_order: 4
parent: Basics
---

## Kubernetes Resources

The kubernate library comes with a set of resources from the Kubernetes API for that specific release/version. You can use these resources using the default export from the library `import kube from "kubernate"`.

The `kube` object gives you access to all the resources bundled with the library. for example to create a deployment you can call the following function: `kube.apps.v1.Deployment(....)`. All resources follow the same signature and can be found in the `kube` object.

The documentation for each resource is can be discovered via intellisense.

