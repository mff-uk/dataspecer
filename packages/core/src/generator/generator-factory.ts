import { DataSpecification } from "../data-specification/model";
import { CoreResourceReader } from "../core";
import { Generator } from "./generator";
import { BikeshedGenerator } from "../bikeshed";
import { JsonSchemaGenerator } from "../json-schema/json-schema-generator";
import { XmlSchemaGenerator } from "../xml-schema/xml-schema-generator";
import { XsltLoweringGenerator } from "../xml-transformations/xslt-generator";
import { XsltLiftingGenerator } from "../xml-transformations/xslt-generator";
import { CsvSchemaGenerator } from "../csv-schema/csv-schema-generator";
import { PlantUmlGenerator } from "../plant-uml";

/**
 * Use this to get generator with included artefact generators from this
 * repository.
 */
export function createDefaultGenerator(
  specifications: DataSpecification[],
  reader: CoreResourceReader
): Generator {
  return new Generator(specifications, reader, [
    new BikeshedGenerator(),
    new JsonSchemaGenerator(),
    new XmlSchemaGenerator(),
    new XsltLoweringGenerator(),
    new XsltLiftingGenerator(),
    new CsvSchemaGenerator(),
    new PlantUmlGenerator(),
  ]);
}
