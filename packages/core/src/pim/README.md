# PIM level

Platform-independent-model (PIM) is the second level of model-driven architecture. Its purpose is to store the domain ontology. Formally, the domain ontology is CIM, but it is copied as PIM because the CIM is not stored locally and may change unpredictably. If the CIM is missing, the ontology is created directly in PIM.

The diagram must be complete, i.e., there must not be any need to load a CIM level entity to resolve the diagram. The reason for this decision is to be able to change the CIM level for a PIM diagram.

This is archived by full specification of all relevant resources when creating a PIM resource. The interpretations are used to propagate any changes in the CIM level as PIM actions.

Unlike connections with CIM, the "extends" operations on the PIM level are implicit.
When one class extends another, it transparently inherits all attributes and associations without the need to specify them.

_Only Data PSM and PIM levels are stored and are needed to create schemas. CIM level is only queried for new resources, and conceptual and structural models are used to simplify PIM and Data PSM models for generators._

This directory is divided into several subdirectories:
- [adapter](adapter) - contains functionality to recreate or save the model, such as RDF representation
- [model](model) - classes representing PIM entities - class, attribute, association, etc.
- [operation](operation) - `CoreOperation` to manipulate the model, such as create class, remove the attribute, etc.
- [executor](executor) - methods that can execute the operations above and modify the model
