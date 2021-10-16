![kubernate logo](https://raw.githubusercontent.com/laurci/kubernate/master/docs/assets/logo_with_text.png)

# Kubernetes + Generate = Kubernate❤️

Kubernate is a Kubernetes YAML generator that can be used as an alternative to other popular tools like Helm. Kubernate is distributed as a library and as a CLI, both working together to achieve one goal: Kubernetes as Code.

[The kubernate homepage](https://kubernate.dev) is a great place to get more information. Also checkout the [getting started guide](https://kubernate.dev/getting-started) for a quick intro in how Kubernate works.

Make sure to join our [Discord community server](https://discord.gg/xhNGGrZQja) to get the latest updates about the development of Kubernate. Here you can also directly chat with contributors if you need help or have any questions.

The official package is available on [NPM](https://npmjs.org/kubernate) but also on [GitHub packages](https://github.com/laurci/kubernate/packages/963222). Make sure to read about the versioning policy (below) before you start using Kubernate.

## Helm sucks! We can all agree, right?

Right? Maybe we aren't on the same page. I am not bringing a new concept to the table, but I am bringing a new perspective. Why exactly is Helm so bad?

The problem is not in Helm, but in the way Helm is used. Let's zoom out a bit. People used to create folders with YAMLs inside and just `kubectl apply`. When there was a need for any kind of automation, they started using `sed`, `awk`, `grep` and friends to manipulate what was basically just a text file. You can imagine, stuff got out of hand pretty quick.

Helm solves this using `charts`. A chart is a collection of Kubernetes resources that can be deployed as a single unit. The trick is that those resources are also templated. Helm uses a template engine to generate the YAMLs and then applies them to the cluster.

Awesome, right? Yes and no. With Helm the problem of text manipulation is solved, but something is still missing. The old school bash automations had soemthing that is very hard to achieve with Helm. It is actually a script, an actual piece of code that gets executed, so you can take decisions based on inputs or outputs of other scripts, or on current state of the cluster ... heck you can even make network requests and do stuff based on the response. I think you get my point. You can't do everything with a template. Even some moderately complex stuff is pretty hard to do with Helm.

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

## Versioning

Kubernate has a lot of components auto-generated from the Kubernetes API. This is great because it means it can always be accurate in relation to the Kubernetes API Server that you are using, but it also means that the versioning is a bit complicated.

Kubernate uses SemVer: the major and the minor are always the major of the Kubernetes API version targeted; the patch is autoincremented for every release and it does not match the Kubernetes API version targeted.

The release strategy is the following:

-   periodic releases (runs every day) for each Kubernetes minor version >= 1.18; this always picks the latest patch from each version and is checked against the latest release of Kubernate for that Kubernetes version; if a new patch was released, then a new patch of Kubernate will be built with the new Kubernetes version
-   manual releases will patch every current releases of Kubernate

Is **very** important to lock the version of the package to the version of Kubernetes you are targeting! For example, if you use Kubernetes 1.19 your `package.json`'s dependencies should include `"kubernate": "~1.19"`.
