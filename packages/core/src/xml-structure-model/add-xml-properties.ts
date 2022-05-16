import {StructureModel} from "../structure-model/model";
import {XmlStructureModel} from "./model/xml-structure-model";
import {CoreResourceReader} from "../core";
import {DataPsmSchema} from "../data-psm/model";
import {DataPsmSchemaXmlExtension} from "../data-psm/xml-extension/model";

/**
 * Transforms structure model to XML structure model by adding properties from
 * PSM specific to XML.
 * @param structure
 * @param reader
 */
export async function structureModelAddXmlProperties(
  structure: StructureModel,
  reader: CoreResourceReader,
): Promise<XmlStructureModel> {
  const result = Object.assign(new XmlStructureModel(), structure);
  const schema = await reader.readResource(structure.psmIri);

  if (!schema || !DataPsmSchema.is(schema)) {
    throw new Error(`Entity is not a PSM schema '${structure.psmIri}'.`);
  }

  const data = DataPsmSchemaXmlExtension.getExtensionData(schema);

  result.namespace = data.namespace;
  result.namespacePrefix = data.namespacePrefix;

  return result;
}
