# @dataspecer/csv

This package contains the functionality and source code related to comma-separated values (CSV) artefacts.
There are two generators.
The implementation is done according to the conventions of the project and the file structure is similar to other generators.
The generators generate a JSON-LD CSVW metadata schema and a corresponding SPARQL query respectively.
The generators share several constants.
The constants are mostly defined in `csv-schema` and imported to `rdf-to-csv`.
This removes code duplication and ensures consistency.
We assiduously created standard comments for functions.
The comments contain the most specific information.
An additional documentation can be easily generated with the tool JSDoc.
See individual subdirectories for more info.
