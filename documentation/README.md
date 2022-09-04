# Documentation index

## General documents

- [what to learn](2022-04-20-what-to-learn.md) is a simple guide to start working on the project
- [model-driven architecture in data modeling](2022-04-21-model-driven-architecture.md) explains the terms such as PIM, Data PSM, store, structure and conceptual models, etc.

## Project structure
- [project structure](2022-04-20-project-structure.md)
- [schema editor structure](../applications/manager/documentation/2022-04-21-project-structure-editor.md)
- [schema manager structure](../applications/manager/documentation/2022-04-21-project-structure.md)
- [backend service structure](../services/backend/documentation/2022-04-21-project-structure.md)

## Design decisions

- [Lerna and packages](2022-02-06-lerna-and-packages.md)
- [code style](2022-02-06-code-style.md)
- [how to contribute to the documentation](2022-02-06-documentation.md)

## Package documentation

Some packages have no documentation or just in a few sentences.

### Applications

See the [project structure](#project-structure) if you are interested in that.

- [Dataspecer cli - command line interface](../applications/cli/README.md)
- [schema editor](../applications/editor/README.md) \
  Functionality worth mentioning: 
  - [configuration](../applications/manager/src/editor/configuration/README.md)
  - [complex operations](../applications/manager/src/editor/operations/README.md)
- [schema manager](../applications/editor/README.md)

### Services

- [backend](../services/backend/README.md)

### Packages

#### Generators

- @dataspecer/core/generator - Generator interface
- [@dataspecer/core/bikeshed](../packages/core/src/bikeshed/README.md) - Bikeshed source generator
- @dataspecer/core/csv-schema - CSV schema generator
- @dataspecer/core/json-schema - JSON schema generator
- @dataspecer/core/plant-uml - Plant UML source (diagrams)
- [@dataspecer/core/xml](../packages/core/src/xml/README.md) - Common utils for XML
- [@dataspecer/core/xml-schema](../packages/core/src/xml-schema/README.md) - XML schema generator
- [@dataspecer/core/xml-transformations](../packages/core/src/xml-transformations/README.md) - XML lifting to RDF and lowering back to XML
- [@dataspecer/core/sparql-query](../packages/core/src/sparql-query/README.md) - Generator of SPARQL CONSTRUCT queries

#### Model driven architecture layers

- [@dataspecer/core/cim](../packages/core/src/cim/README.md) - first level of model driven architecture
- [@dataspecer/core/conceptual-model](../packages/core/src/conceptual-model/README.md) - simplification of PIM layer
- [@dataspecer/core/data-psm](../packages/core/src/data-psm/README.md) - third level of model driven architecture
- [@dataspecer/core/pim](../packages/core/src/pim/README.md) - second level of model driven architecture
- [@dataspecer/core/sgov](../packages/core/src/sgov/README.md) - CIM adapter for SGOV ontology
- [@dataspecer/core/structure-model](../packages/core/src/structure-model/README.md) - simplification of Data PSM layer

#### Core and helper packages

- [@dataspecer/core/core](../packages/core/src/core/README.md) - core interfaces
- [@dataspecer/core/io](../packages/core/src/io/README.md) - input output interfaces
- [@dataspecer/core/well-known](../packages/core/src/well-known/README.md) - constants

#### Store wrapper
- [@dataspecer/federated-observable-store](../packages/federated-observable-store/README.md) - a store that can federate multiple stores with the observer pattern
- [@dataspecer/federated-observable-store-react](../packages/federated-observable-store-react/README.md) - React hooks for easy access to resources

#### Backend utils
- [@dataspecer/backend-utils](../packages/backend-utils/README.md) - utils for communication with backend

#### Data specification
- @dataspecer/core/data-specification - project housing multiple schemas
