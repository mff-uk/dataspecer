# RDF to CSV transformation

This generator creates SPARQL queries.
The queries transform a user-defined data structure in the RDF format into a tabular schema corresponding to the schema from the `csv-schema` generator.
The `rdf-to-csv` generator generates one or more SPARQL queries and separates them into separate files.
Each query produces a table.
We avoided code duplication and reused SPARQL data model from another package.
This data model does not support multiple queries.
We simply used an array of queries to solve this issue.
For this reason, we had to slightly modify the generator.
The function `generateToStream` in the generator inspects the returned type and writes to a provided stream one or more paths and files.
Other packages were not modified.
The generator itself reads the configuration and decides whether to create a single query or multiple queries.
We decided to make the decision as soon as possible in order to reduce the number of functions with the union return types.

The query builder reads an instance of structure model and creates SPARQL queries.
The algorithms resemble the `csv-schema` generator because the queries correspond to the tables.
There is still a recursive nature of the structure model.
The `rdf-to-csv` generator and the `csv-schema` generator traverse the structure model in a similar way.
A SPARQL query has three parts, i.e. `prefixes`, `select` and `where`.
The `prefixes` and `where` parts are the same for a given structure model.
The parts in a single table query are the same in each query from multiple table queries.
That is because they represent the structure of the structure model.
The `select` parts are usually different.
This behavior is tested by unit tests.
There are main functions and auxiliary functions.
The auxiliary functions perform simple tasks for the main functions.

The single table query creation has two main functions, `buildSingleTableQuery` and `buildSingleQueryRecursive`.
The first function initializes the data model and the second function fills the model with values.
The values are filled to the provided parameters of the function.
The return value serves only to the execution of recursion.
The single table query corresponds to the single table schema.

The multiple table queries option is more complex.
There two main functions, `buildMultipleTableQueries` and `buildQueriesRecursive`.
The first function prepares the data model, calls the second function to compute necessary values and then builds individual queries.
The `prefixes` and `where` parts are the same in all queries and they are created only once.
All the queries have a reference to the same object for each shared part.
Each query corresponds to a table from the multiple table schema.
There is SPARQL comment in each query with the URL of the corresponding table.
This is just for the user's convenience.
