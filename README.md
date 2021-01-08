# Stormy CLI

![Build](https://github.com/railwayapp/cli/workflows/Build/badge.svg)

This is the command line interface for [Stormy](https://stormyapp.com). Use it to speed up your compilation by 70%.
Stormy uses cloud to speed up the compile time.

# There are two modes to use stormy:-
 
## OnPremise  
This mode allows the user to connect stormy to there own server. Syncing the changes continously with the onPrem server and making speeding up the compile time.

## stormyMode
Stormy handles the compilation by using our highly powerful server. We are able to acheive a 70% reduction in the compile time.

[View the docs](https://stormyapp.com/docs/cli)

# Installation

The Stormy CLI is available through [NPM](https://www.npmjs.com/package/stormy_build). We used Node to write the CLI but it works well with the Rust and Java as well.

### NPM

```shell
npm i -g stormy_build
```

# Documentation

Init the stormy in your project folder.

```shell
stormy init
```

Start Executing commands in the project folder like build etc.

```shell
stormy command_to_be_executed
```
[View the full documentation](https://stormyapp.com/docs/cli)

## Feedback

We would love to hear your feedback or suggestions. The best way to reach us is on [Discord](https://discord.gg/sw6UkzVpF2) or [Twitter](https://twitter.com/AppStormy) .

We also welcome pull requests into this repo. See [CONTRIBUTING.md]() information on setting up this repo locally.
