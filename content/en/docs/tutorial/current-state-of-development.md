---
title: "Current state of the development"
menu:
  docs:
    parent: "tutorial"
weight: 25
toc: true
---

Dataspecer is still an experimental software, meaning that only the core functionality is implemented, whether the advanced features are still highly unstable. Therefore, using the tool in a production environment can be an obstacle. Below is a table of main features we would like to implement into the Dataspecer in the future.

The table below shows our goals. ✅ is done or almost done, ⚒ is that the feature is being worked on, and ❌ is that the feature is only planned.

### Core features

| Feature | State |
|--|--|
| Designing a basic schema, using inheritance and schema reuse | ✅ |
| Import of already existing specifications | ✅ |
| Data transformations between schemas | Only through RDF  |
| Schemas with OR and including subschemas <br /> _Allowing choice on schema levels, such as `person or animal`._ | ⚒ |
| Support for SOLID | ❌ |
| Change propagation <br /> _Automatically modify schemas from changes introduced in the domain ontology._ | ❌ |
| Deriving schemas <br /> _Derive one schema from another, but try to propagate changes if the source schema changes._ | ❌ |

### Generators
| Generator | State |
|--|--|
| JSON Schema, JSON-LD | ✅ |
| XML Schema, XSD between XML and RDF-XML | ✅ |
| CSV Schema, CSVW | ✅ |
| SPARQL query for structures mapped to ontologies | ✅ |
| Conceptual model images | ✅ |
| Documentation | Only tailored for our use-case |
| Examples | ❌ |
| OpenAPI specification | ❌ |

### Adapters
| Adapter | State |
|--|--|
| Czech Semantic Government Vocabulary | ✅ |
| RDFS/OWL | ⚒ (Has some bugs) |
| Wikidata | ❌ |
| Support for [LOV](https://lov.linkeddata.es/) | ❌ |
| Enterprise Architect | ❌ |
