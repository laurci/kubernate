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

Yarn may also be used. Kubernate has to be installed globally for code completion ([here](/setup) is how to setup that) to work and to be able to use the `kubernate init` command, for eveything else, the binary that is shipped with the library can be used.

### Creating a Kubernate project

You may use the `kubernate init` ([more info here](/commands/init)) command to create a Kubernate project.

```bash
kubernate init my-first-project
```
