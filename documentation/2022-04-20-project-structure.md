# Project structure

As already mentioned in [Lerna and packages](2022-02-06-lerna-and-packages.md) section, the whole codebase is split into smaller, more self-contained packages linked to each other by Lerna. This approach allows us to have a single monorepository of multiple applications, different packages and services instead of managing numerous git repos.

## File structure

Packages are split into several directories to keep things organized. You can see the full list in main [README.md file](../README.md).
- [applications](../applications)
- [packages](../packages)
- [services](../services)

Beside these directories, [documentation](../documentation) contains general documentation and design decisions and [utils](../utils) is intended for various helper scripts and utilities.

## Software architecture

