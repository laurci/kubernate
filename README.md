# Kubernetes + Generate = Kubernate❤️

Kubernate is a Kubernetes YAML generator that can be used as an alternative to other popular tools like Helm. Kubernate is distributed as a library and as a CLI, both working toghether to achieve one goal: Kubernetes as Code.

[The kubernate homepage](https://kubernate.dev) is a great place to get more information. Also checkout the [getting started guide](https://kubernate.dev/getting-started) for a quick intro in how Kubernate works.

The official package is available on [NPM](https://npmjs.org/kubernate) but also on [GitHub packages](https://github.com/laurci/kubernate/packages/963222).

## Versioning

Kubernate has a lot of components auto-generated from the Kubernetes API. This is great because it means it can always be accurate in relation to the Kubernetes API Server that you are using, but it also means that the versioning is a bit complicated.

Kubernate uses SemVer: the major and the minor are always the major of the Kubernetes API version targeted; the patch is autoincremented for every release and it does not match the Kubernetes API version targeted.

The release strategy is the following:

-   periodic releases (runs every day) for each Kubernetes minor version >= 1.18; this always picks the latest patch from each version and is checked against the latest release of Kubernate for that Kubernetes version; if a new patch was released, then a new patch of Kubernate will be built with the new Kubernetes version
-   manual releases will patch every current releases of Kubernate

Is **very** important to lock the version of the package to the version of Kubernetes you are targeting! For example, if you use Kubernetes 1.19 your `package.json`'s dependencies should include `"kubernate": "~1.19"`.
