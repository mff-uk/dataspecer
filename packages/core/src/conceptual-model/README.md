# Conceptual model

The conceptual model is a simplification of the [PIM level](../pim/README.md). The objective is to make work with the PIM model easier compared to working with raw representation in PIM.

Generators use the conceptual model instead of PIM.

Associations may be an example. In PIM, the association requires 3 entities - the association itself and two association ends. In the conceptual model, the association has a similar structure to an attribute, making the work with class properties easier.

In the similar manner, a [structure model](../structure-model) simplifies [Data PSM](../data-psm).

This directory is divided into several subdirectories:
- [adapter](adapter) - functionality to load Conceptual model from PIM
- [model](model) - classes representing the model
