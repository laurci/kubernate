---
layout: default
title: Kubernate config file
nav_order: 3
parent: Basics
---

## .kubernaterc.yaml

The `.kubernaterc.yaml` file is a YAML file that contains the configuration for the Kubernate CLI. This file is also used to determine the root directory of your Kubernate project.

The only required field is `targetVersion`, which is the version of Kubernate project spec that you want to use. For now the only accepted value is `v1`.

## Kubernate Scripts

To declare a script you must specify the `scripts` key. The value of this key is an object tha contains the script names as the keys and the script paths as the value.

```yaml
targetVersion: "v1"
scripts:
    hello-world: ./src/hello-world.ts
```

In this example the script `hello-world` is declared and is pointed to the file `./src/hello-world.ts`. All file paths are relative to the `.kubernaterc.yaml` file.

## Kubernate Resources

The configuration of the Kubernate resources is done by declaring the `resources` key. The value of this key is an object that contains a few configuration options for the resources generation:

-   **entry**: is the path of the entry point of the resources declaration. This value is required.
-   **entryTypeName**: is the name of the typename that will be used to declare the entry point. This value is optional and if it is not specified, it will be inferred as the first name export of a type union.
-   **exclude**: is a list of globs that will be used to exclude files from the resources generation. This value is optional.
-   **include**: is a glob that will be used to include files in the resources generation. This value is optional.
-   **output**: is an object that contains the output configuration for the resources generation. This value is required and contains the following keys:
    -   **code**: is the path to the folder that will contain the generated code. This value is required.
    -   **schemas**: is the path to the folder that will contain the generated schemas. This value is required.

Here is an example of how this might be configured:

```yaml
targetVersion: "v1"
scripts:
    hello-world: ./src/hello-world.ts
resources:
    entry: ./src/resources/index.ts
    entryTypeName: Resources
    exclude:
        - output/*
    include: input/*.yaml
    output:
        code: ./src/generated
        schemas: ./schemas
```

## CRDs generation

Kubernate also allows to generate types for resources that are not included in Kubernetes. This is done by declaring the `crds` key. The value of this key is an object that contains the following configuration options:

-   **output**: is the path to the folder that will contain the generated CRDs code. This value is required.
-   **list**: is a list that contains some objects that are used to configure the generation of the CRDs. This value is required. The list contains objects with the following keys:
    -   **path**: is the path to the file that contains the CRD definition. This value is required.
    -   **name**: is the name of the CRD. This value is required.
    -   **groupPrefix**: is the prefix of the CRD group. This value is required.

An example of how this might be configured:

```yaml
targetVersion: "v1"
crds:
    output: ./src/generated/crds
    list:
        - groupPrefix: k8s.elastic.co
          name: elastic
          path: crds/elastic.yaml
        - groupPrefix: cert-manager.io
          name: certManager
          path: crds/cert-manager.yaml
```
