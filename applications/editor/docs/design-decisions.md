Design decisions
================

The purpose of this document is to archive all the decisions important for the understanding of the codebase as well as keep the codebase consistent.

## Passing IRI vs. Entity object
When component needs to render an entity from model, we can pass IRI of the entity or the entity itself.

 - Passing the entity itself may not be consistent with the model structure, because model links entities by IRI, not references. *A typical example is obtaining PIM entity from PSM. We need to convert string IRI to an Entity object. Therefore, we can also convert PSM IRI string to PSM object - hence the consistency.*

**Conclusion:** It is preffered to pass IRI string before the entity object.
