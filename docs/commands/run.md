---
layout: default
title: run
nav_order: 4
parent: Commands
---

## kubernate `<script-name>`

The `kubernate run` command is a pseudo command that runs a script. For every script that you have defined in a project a new command `kubernate <script-name>` is created.

This is the output of `kubernate --help` in a project that has defined one script called `hello-world`:

```
kubernate <command>

Commands:
  kubernate generate     Run the generation procedure for the schemas
  kubernate hello-world  Runs the hello-world script from your project
  kubernate completion   generate completion script

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```
