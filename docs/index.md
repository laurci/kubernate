---
layout: default
title: Introduction
nav_order: 1
---

![kubernate logo](https://raw.githubusercontent.com/laurci/kubernate/master/docs/assets/logo_with_text.png)

## Intro

Kubernate is a Kubernetes YAML generator that can be used as an alternative to other popular tools like Helm. Kubernate is distributed as a library and as a CLI, both working together to achieve one goal: Kubernetes as Code.

Checkout the [getting started guide](/getting-started) for a quick intro in how Kubernate works.

The official package is available on [NPM](https://npmjs.org/kubernate) but also on [GitHub packages](https://github.com/laurci/kubernate/packages/963222). Make sure to read about the versioning policy before you start using Kubernate [here](/versioning.html).

## Helm sucks! We can all agree, right?

Right? Maybe we aren't on the same page. I am not bringing a new concept to the table, but I am bringing a new perspective. Why exactly is Helm so bad?

The problem is not in Helm, but in the way Helm is used. Let's zoom out a bit. People used to create folders with YAMLs inside and just `kubectl apply`. When there was a need for any kind of automation, they started using `sed`, `awk`, `grep` and friends to manipulate what was basically just a text file. You can imagine, stuff got out of hand pretty quick.

Helm solves this using `charts`. A chart is a collection of Kubernetes resources that can be deployed as a single unit. The trick is that those resources are also templated. Helm uses a template engine to generate the YAMLs and then applies them to the cluster.

Awesome, right? Yes and no. With Helm the problem of text manipulation is solved, but something is still missing. The old school bash automations had something that is very hard to achieve with Helm. It is actually a script, an actual piece of code that gets executed, so you can take decisions based on inputs or outputs of other scripts, or on current state of the cluster ... heck you can even make network requests and do stuff based on the response. I think you get my point. You can't do everything with a template. Even some moderately complex stuff is pretty hard to do with Helm.

## This sounds like Pulumi?

Yes :) I actually used Pulumi in a project to manage a development Kubernetes cluster. It is a great infra-as-code tool, but it has a few problems when it comes to managing Kubernetes resources:

-   It tries to manage it's own state on top of Kubernetes (which is also declarative). This is not very useful for most of the time. Also sometimes the state of the cluster gets out of sync with the state of the Stack.
-   It becomes very slow when you have a lot of resources (this happened to me because I was managing a development cluster with feature-branch preview environments).
-   The programming model is not very intuitive. It is async and declarative at the same time, a bit weird...; and also very OOP (which is something I personally don't like, but let's not get into that talk :]).
-   When you deploy somehting to a kubernetes cluster, the process will wait for everthing to be well and healthy. This is generally a good thing, until you have one ImagePullBackOff that is waited for 10 minutes by all the other deployment items.

Other then that, it is a great tool and a source of inspiration :)

## So what is Kubernate?

It is a bit of both :) **Kubernate** is a library that is used to generate Kubernetes YAML files with ease. Think like Helm but with actual code. You have the power to generate anything you want while using any kind of input you want. Everything is evaluated at "build" time and the output is 100% static valid Kubernetes YAML. You also get to leverage the tooling built for Typescript (which is actually very good) while building and **DEBUGGING** your deployments. You can also publish "_libraries_" built with Kubernate to NPM and other Kubernate-based projects can use them as building blocks.

There is no programming model to speak of :) just write code and use it. At the end the tool runs the code :) You can even skip this step and just build the Typescript into javascript and run it with Node. You can even make your own app on top of Kubernate to manage your deployments.

The library itself is very simple and it is also very fast. It is written in Typescript and it is very easy to use. It is also very easy to learn and understand. Everything is typed! Just follow the intellisense.

## Compatibility with other tools

Nothing stops you from using Kubernate with other tools. You can even use Kubernate as a library to generate Kubernetes YAML files for other tools (like Helm and Kustomize).

I actually use it to generate the base for Kustomize (better integration comming soon) and i love it :) I just have to write the overlays but that could also be generated.

## Let's go!

[Here](/getting-started) is a getting started guide for Kubernate, and [here](/basics) you can explore the basics. You can also check out the [examples](https://github.com/laurci/kubernate-examples) for more code.
