# About
On the platform-independent-model (PIM) level the diagram must be complete, i.e., there must not be any need to load a CIM level entities to resolve the diagram. 
The reason for this decision is to be able to change the CIM level for a PIM diagram.

This is archived by full specification of all relevant resources when creating a PIM resources.
The interpretations are used to propagate any changes in the CIM level as PIM actions.

Unlike connections with CIM the "extends" operations on PIM level are implicit. 
When one class extends another, it transparently inherits all attributes nad associations without the need to specify them.
