# CIM adapter interface

This directory contains the interface for CIM adapters.

See [model-driven architecture in data modeling](../../../../documentation/2022-04-21-model-driven-architecture.md) for more details.

The interface is designed in a way, that the returned ontology is in the same format as PIM, because the purpose of the PIM layer is to either copy data from CIM, or replace CIM, if the user creates its own ontology. However, the ontology from adapters can't be stored directly to the local PIM model because the model can be modified only through operations. 
