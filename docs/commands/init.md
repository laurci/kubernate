---
layout: default
title: init
nav_order: 2
parent: Commands
---

The `kubernate init` command is used to create a new Kubernate project.

## kubernate init

```
kubernate init <name>

start a new project with kubernate

Positionals:
  name  the name of the project                              [string] [required]

Options:
      --version          Show version number                           [boolean]
      --help             Show help                                     [boolean]
  -p, --path             the path to the project (defaults to the $CWd/name)
                                                                        [string]
  -t, --template         the name of the source template
     [string] [required] [choices: "basic", "with-resources"] [default: "basic"]
  -m, --package-manager  the package manager to use
                                       [choices: "npm", "yarn"] [default: "npm"]
```
