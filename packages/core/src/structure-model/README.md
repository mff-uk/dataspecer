# Structure model

The structure model simplifies [Data PSM](../data-psm). The objective is to make work with the Data PSM model easier compared to working with raw representation in Data PSM.

This model does not load nor interpret any values from the PIM level. For that, you must use transformations.

Generators use the structure model instead of Data PSM.

In the similar manner, a [conceptual model](../conceptual-model) simplifies [PIM](../pim).

This directory is divided into several subdirectories:
- [adapter](adapter) - functionality to load the structure model from Data PSM
- [model](model) - classes representing the model
- [transformation](transformation) - functions that can enrich the model with additional data, such as CIM IRI, labels, etc.
