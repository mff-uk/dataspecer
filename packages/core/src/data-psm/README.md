# Data PSM level

Data platform-specific model (data-psm) is the third level of the model-driven architecture. It represents the schema, hence having the tree structure, unlike the PIM model with its graph structure. The PSM level classes do not automatically have all properties of their PIM interpretations. They need to be added explicitly.

Schema is represented by `DataPsmSchema`, which is a root of the PSM tree. Then, the schema may contain classes or references to class, attributes, and association ends.

_Only Data PSM and PIM levels are stored and are needed to create schemas. CIM level is only queried for new resources, and conceptual and structural models are used to simplify PIM and Data PSM models for generators._

This directory is divided into several subdirectories:
- [adapter](adapter) - contains functionality to recreate or save the model, such as RDF representation
- [model](model) - classes representing PSM entities - class, attribute, class reference, etc.
- [operation](operation) - `CoreOperation` to manipulate the model, such as create class, remove the attribute, etc.
- [executor](executor) - methods that can execute the operations above and modify the model
