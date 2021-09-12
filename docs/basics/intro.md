---
layout: default
title: Intro
nav_order: 2
parent: Basics
---

## Kubernate basics

Kubernate is a library (and CLI) for generating Kubernetes resources using code.

Almost every component of the Kubernetes API is functional and relies on generated code.

## The Kubernate Library

Everything in Kubernate is a function. There are no classes in the API that you will interact with. This is not a goal of Kubernate but overall a better way to organize the API.

It comes packaged as a directory-style library. Most imports are from the main package (`import ... from "kubernate"`). Some specialized imports are from `"kubernate/output"` or `"kubernate/resources/*"` but can also be imported as named exports from `"kubernate"` (`import {output} from "kubernate"` instead of `import output from "kubernate/output"`). The library can be tree-shaken by bundlers, but most of the time there won't be any build step to speak of.

Kubernate doesn't enforce any programming model. It's up to you to decide what you want to do.

## Kubernate scripts

You can use Kubernate in any node (>=14.x) runtime, you can use `ts-node` to run the program or you can use `tsc` to compile the program to JavaScript and then run it with node. You can even bundle the project using somthing like `Webpack` or `Rollup`. It is also compatible with `esbuild`. The output can be published on NPM and other packages can use it. Kubernate also supports `yarn pnp` and works well with `yarn link` and `yarn workspaces`, so you can finally mono-repo your infra as code :)

A kubernate script can also be run using the `kubernate` command. You can define scripts in the [`.kubernaterc`](/basics/kubernaterc) file and then run them with `kubernate <script-name>` while in the project directory. Every script **must** export a **default** function that must return a `Promise`. Checkout [this](/getting-started.html#explore-the-created-project) for an example.

## The kubernate CLI

The kubernate CLI can be used to execute the scripts defined in the [`.kubernaterc`](/basics/kubernaterc) file, to create new projects, to generate the code needed for Resources, CRDs and schemas, to provide completion and other utilities. Checkout [this](/commands) for more information.
