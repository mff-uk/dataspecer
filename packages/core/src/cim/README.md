# CIM adapter interface

This directory contains the interface for CIM adapters.

**CIM** is the topmost layer in our model containing the source ontology. We do not have requirements on format - **ontology specification language** of the CIM layer, therefore adapters are required to provide the data in supported format. The interface is highly adapted to the final use, therefore methods such as getSurrounding or getHierarchy are used.

Most used ontology specification languages are: RDF Schema, OWL, Schema.org or Wikidata. We already support [SGOV](../sgov) format.

The interface is designed in a way, that the returned ontology is in the same format as PIM, because the purpose of the PIM layer is to either copy data from CIM, or replace CIM, if the user creates its own ontology. However, the ontology from adapters can't be stored directly to the local PIM model because the model can be modified only through operations. 
