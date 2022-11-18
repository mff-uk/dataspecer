import {BikeshedGenerator} from "@dataspecer/bikeshed";
import {SparqlGenerator} from "@dataspecer/sparql-query";
import {PlantUmlGenerator} from "@dataspecer/plant-uml";
import {JsonLdGenerator} from "@dataspecer/json/json-ld";
import {JsonSchemaGenerator} from "@dataspecer/json/json-schema";
import {XmlSchemaGenerator} from "@dataspecer/xml/xml-schema";
import {XmlCommonSchemaGenerator} from "@dataspecer/xml/xml-common-schema";
import {XsltLiftingGenerator, XsltLoweringGenerator} from "@dataspecer/xml/xml-transformations";
import {CsvSchemaGenerator} from "@dataspecer/csv/csv-schema";
import {RdfToCsvGenerator} from "@dataspecer/csv/rdf-to-csv";

/**
 * Returns all artefact generators that will be used in the application.
 * This is the place to register your own artefact generators if you need to.
 */
export function getArtefactGenerators() {
    return [
        // Standalone generators
        new BikeshedGenerator(),
        new JsonLdGenerator(),
        new JsonSchemaGenerator(),
        new XmlSchemaGenerator(),
        new XmlCommonSchemaGenerator(),
        new XsltLoweringGenerator(),
        new XsltLiftingGenerator(),
        new CsvSchemaGenerator(),
        new RdfToCsvGenerator(),
        new PlantUmlGenerator(),
        new SparqlGenerator(),
    ];
}
