# cli application

Dataspecer command-line interface. The cli allows you to generate artifacts from the command line for the given data specification IRI. It connects to the [backend](../../services/backend) service to download all data.

Please keep in mind that this is still an experimental feature. More details are in the [Github discussion](https://github.com/mff-uk/dataspecer/discussions/183).

You may use the [testing environment](../../utils/testing-environment) utils to build a Docker image with the additional tools for XML schema processing, etc.

## Usage

To generate artifacts use
```shell
dataspecer generate <data-specification-iri>
```

## Build instructions

Please use the [build instructions from the editor](../editor/README.md). The apps are similar in structure.

The generated file is then located in the `dist` directory.

