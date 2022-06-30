# SPARQL query generator

This directory contains the source codes used by generator of [SPARQL](https://www.w3.org/TR/sparql11-overview/) queries.

The generation process uses a model of a subset of the SPARQL syntax, stored in `sparql/model.ts`, supporting `PREFIX`, `SELECT`, `CONSTRUCT`, `WHERE`, `OPTIONAL`, `UNION`, and the representation of variable and URI nodes, possibly abbreviated with prefixes. A query is represented by the `SparqlQuery` class.

The first part of the process creates an instance of `SparqlQuery` from the structure model, which is then written out as text in the second part.

## SPARQL adapter

The class `SparqlAdapter`, located in `sparql-model-adapter.ts`, is used by the generator to convert a structure model to a SPARQL `CONSTRUCT` query.

The conversion starts in `fromRoots`, which recursively traverses the whole model, starting from its root classes. The result is a `UNION` of the patterns produced for each class in `classToTriples`. SPARQL variables are automatically created by `newVariable` when a new variable node is required.

In `classToTriples`, a pattern is created that matches an instance of class, optionally including the `?instance a ?type` triple, then followed by the pattern constructed for every triple in `propertyToTriples`.

Inside `propertyToTriples`, a representation of the triple `?instance <property> ?object` is produced for each datatype of the property, producing a `UNION` of patterns. For associations, this is also followed by a pattern that matches the type of `?object` and its properties.

If a property's cardinality includes 0, the pattern to a property is wrapped in `OPTIONAL`.

## SPARQL writer

The writer, located in `sparql-writer.ts`, writes the contents of a `SparqlQuery` as text in the SPARQL syntax. This generally perfectly follows the structure of the pattern, but there are differences:

* For simplicity, the adapter sets the `CONSTRUCT` part of the query to be the same as its `WHERE` part, as the purpose of the query is just to retrieve the relevant subgraph covered by the structure model. When writing the pattern inside `CONSTRUCT`, all occurrences of `OPTIONAL` and `UNION` are ignored, and only their contents are written.

* The `SparqlUnionPattern` class, representing a `UNION`, is allowed to contain only 0 or 1 pattern. In that case, no special syntax is written, only the contents.
