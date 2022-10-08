# model-driven architecture in data modeling

_This document describes the role of the model-driven architecture in data modeling. It explains the terms like a store, PIM, Data Psm, Data specification, and Data schema._

This approach is not new and was already studied [1] and implemented in the tools XCase [2] and eXolutio [3].

The idea is to split the modeling into layers and modify the data through atomic operations. Executed operations can be stored to later re-execute them in different model or propagate them into the other layers.

## CIM: Computational-independent model

CIM is the topmost layer representing the domain ontology. No specific format or property is required. The ontology is stored on the Internet, and adapters (see `CimAdapter`) are required to access the CIM because of different ontology specification languages. Most used ontology specification languages are: RDF Schema, OWL, Schema.org, or Wikidata. We already support the SGOV format.

We must not depend on the CIM directly because it may change or be inaccessible. Therefore, all the relevant data are stored in the PIM layer (see below). CIM is used only for adding new classes, attributes and associations into the model.

Theoretically, if there is no database with the ontology required, CIM is not needed.

### Implementation

See the interface for [@dataspecer/core/cim](../packages/core/src/cim) or implementation for [SGOV](../packages/sgov-adapter/src).

## PIM: Platform independent model

PIM is the second level of model-driven architecture. Its purpose is to store the domain ontology locally as a copy of CIM. If the CIM is missing, the ontology is created directly in PIM.

The diagram must be complete, i.e., there must not be any need to load a CIM level entity to resolve the diagram. The reason for this decision is to be able to change the CIM level for a PIM diagram.

This is archived by s full specification of all relevant resources when creating a PIM resource. The interpretations are used to propagate any changes in the CIM level as PIM actions.

Unlike connections with CIM, the "extends" operations on the PIM level are implicit.
When one class extends another, it transparently inherits all attributes and associations without the need to specify them.

### Implementation

See [@dataspecer/core/pim](../packages/core/src/pim/README.md) for more details.

## Data PSM: Data Platform-specific model

Data PSM is the third level of the model-driven architecture. It represents the schema, hence having the tree structure, unlike the PIM model with its graph structure. The PSM level classes do not automatically have all properties of their PIM interpretations. They need to be added explicitly.

The root of the PSM tree is a PSM schema. Then, the schema may contain classes or references to class, attributes, and association ends.


Only Data PSM and PIM levels are stored and are needed to create schemas. CIM level is only queried for new resources, and conceptual and structural models are used to simplify PIM and Data PSM models for generators.

### Implementation

See [@dataspecer/core/data-psm](../packages/core/src/data-psm/README.md) for more details.

---

## Stores

Stores are objects where PIM and Data PSM resources are saved. There is a convention that every resource PIM and Data PSM must belong to a schema.

### Implementation

Stores are [`CoreResourceReader`](../packages/core/src/core/core-reader.ts) and optionally [`CoreResourceWriter`](../packages/core/src/core/core-writer.ts).

## Data specification and data schema

Data specification is a project that can house multiple data schemas. Data schema then corresponds to Data Psm Schema and is the tree that represents the concrete XML, JSON, or CSV schema.

We have a convention, that the whole data specification contains exactly one PIM store. That means all schemas in same data specifications share the PIM. Each data schema then has another store only for Data PSM. Specification with two schemas has, therefore, three stores.

### Implementation

See [@dataspecer/core/data-specification](../packages/core/src/data-specification). Data schema has no implementation itself.

---

## Operations

To modify resources in stores, operations are required. As mentioned at the top of this document, explicitly using operations has several advantages.
- For most basic operations, it is possible to create analogous operation in the layer below, hence propagating the operations below.
- Storing operations with the model can resolve merge conflicts; stores do not have to be available all the time because we can apply changes later.

---

## Conceptual and structure models

Because the PIM and Data PSM may be too difficult to handle for most cases (such as getting a class field list), conceptual and structure models are introduced. The conceptual model represents PIM; the structural represents Data PSM.

Associations may be an example. In PIM, the association requires 3 entities - the association itself and two association ends. In the conceptual model, the association has a similar structure to an attribute, making the work with class properties easier.

Generators use the these models instead of PIM and Data PSM.


---

[1] Nečaský, M., Mlýnková, I., Klímek, J., Malý, J.: When conceptual model meets
grammar: A dual approach to XML data modeling. Data & Knowledge Engineering
72, 1–30 (2012). https://doi.org/10.1016/j.datak.2011.09.002

[2] Klímek, J., Kopenec, L., Loupal, P., Malý, J.: XCase - A Tool for Conceptual XML
Data Modeling. In: Advances in Databases and Information Systems, Associated
Workshops and Doctoral Consortium of the 13th East European Conference, ADBIS
2009, Riga, Latvia, September 7-10, 2009. Revised Selected Papers. LNCS, vol. 5968,
pp. 96–103. Springer (2009). https://doi.org/10.1007/978-3-642-12082-4_13

[3] Klímek, J., Malý, J., Nečaský, M., Holubová, I.: eXolutio: Methodology for Design
and Evolution of XML Schemas Using Conceptual Modeling. Informatica 26(3),
453–472 (2015), https://content.iospress.com/articles/informatica/inf1065
