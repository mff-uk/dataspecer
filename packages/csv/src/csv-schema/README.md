# CSV Schema

There is a generator of JSON-LD CSVW metadata artefact.
The generator is based on [CSV on the Web](https://www.w3.org/TR/2016/NOTE-tabular-data-primer-20160225/) specification.
There are unit tests and resources for unit tests.
The resources are large because they represent big and representative user-defined data structures as well as edge cases.
The tests cover various aspects of the generated schema across several data structures.

## Data model

Classes in the data model are designed to represent the entities from the metadata specification.
We used convenient features of TypeScript, e.g. inheritance and polymorphism.
Individual classes have intuitive names which suggest the corresponding entities from the metadata specification.

There are two kinds of table schema, i.e. for a single table (`SingleTableSchema`) and for multiple tables (`MultipleTableSchema`).
These classes have their common functionality in their abstract parent.
They can convert themselves to the JSON-LD format.
Most of the fields of the classes come from the specification.
The other classes hold the data for particular entities.
The fields contain either a primitive value or an instance of some class from the data model.
The model is basically a tree created by a reasonable composition.

We created a compact and elegant way of serialization.
The JSON format is, of course, supported by the TypeScript language.
We simply created the function `replacer` in order to customize the built-in function.
Simple classes can be directly serialized and complex classes contain methods for their serialization.
We solved the conversion to the JSON-LD format in an object-oriented fashion.
This is quite different from the other generators.

## Model adapter

The model adapter reads an instance of the structure model and creates a corresponding instance of the data model.
The main function is `structureModelToCsvSchema`.
It only decides which kind of CSV should be created, i.e. a single table or multiple tables.
The creation of a table schema is done in two steps.
There is an initial preparation and a recursive function.
The functions can be recognized by their clear and intuitive names.
The other functions are auxiliary and they perform simple tasks for the main functions.
The purpose of parameters is described in the comments.

The single table creation has two main functions, `makeSingleTableSchema` and `fillColumnsRecursive`.
The structure model is a tree and it is recursively traversed.
Columns are created at leaves of the tree.
The traversing function uses attributes of the path to the leaf to create other attributes of the corresponding column.
There is nothing returned from the function.
The created columns are saved in an array from the parameters.
The table is, of course, denormalized.

The multiple tables schema is more complex because it needs to make more complicated decisions.
There are two main functions again, `makeMultipleTableSchema` and `makeTablesRecursive`.
Recursive calls create individual tables as well as columns.
The decisions are based on current position in the structure model and the properties of the structure model namely datatype, required status and cardinality.
We use a common way of creating a schema of normalized tables.
There are special tables for multiple properties and special linking tables with foreign keys.
There are particular functions for such tables.
The function returns an identifier of the created table.
This only serves to link tables.
The tables are saved in an array from the parameters.
