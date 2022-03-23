import { BikeshedGenerator } from "../bikeshed";
import { JsonSchemaGenerator } from "../json-schema/json-schema-generator";
import { XmlSchemaGenerator } from "../xml-schema/xml-schema-generator";
import { XsltLoweringGenerator } from "../xml-transformations/xslt-generator";
import { XsltLiftingGenerator } from "../xml-transformations/xslt-generator";
import { CsvSchemaGenerator } from "../csv-schema/csv-schema-generator";
import { PlantUmlGenerator } from "../plant-uml";

/**
 * Use this to get artefact generators from this repository.
 */
export function createDefaultArtefactGenerators() {
  return [
    new BikeshedGenerator(),
    new JsonSchemaGenerator(),
    new XmlSchemaGenerator(),
    new XsltLoweringGenerator(),
    new XsltLiftingGenerator(),
    new CsvSchemaGenerator(),
    new PlantUmlGenerator(),
  ];
}
