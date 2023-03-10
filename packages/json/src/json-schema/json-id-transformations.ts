import {StructureModel, StructureModelClass, StructureModelComplexType, StructureModelCustomType, StructureModelProperty} from "@dataspecer/core/structure-model/model";
import {clone} from "@dataspecer/core/core";
import {JsonConfiguration} from "../configuration";
import { getClassTypeKey } from "../json-ld/json-ld-adapter";

/**
 * For each PSM class with CIM interpretation, it adds iri and type property
 * based on generator configuration.
 * @see https://github.com/mff-uk/dataspecer/issues/245
 */
export function structureModelAddIdAndTypeProperties(
  structure: StructureModel,
  configuration: JsonConfiguration,
): StructureModel {
  const result = clone(structure) as StructureModel;
  const classes = result.getClasses();
  for (const structureClass of classes) {
    // todo: properties are added only to non-empty classes as empty are treated differently
    if (structureClass.cimIri !== null && structureClass.properties.length > 0) {
      if (configuration.jsonTypeKeyAlias !== null) {
        const typeKeyValue = getClassTypeKey(structureClass, configuration);

        const datatype = new StructureModelCustomType();
        datatype.data = {
          oneOf: [
            {
              const: typeKeyValue
            },
            {
              type: "array",
              contains: {
                const: typeKeyValue
              },
              items: {
                type: "string"
              }
            }
          ]
        };

        const id = new StructureModelProperty();
        id.technicalLabel = configuration.jsonTypeKeyAlias;
        id.cardinalityMax = 1;
        id.dataTypes = [datatype];

        structureClass.properties.unshift(id);
      }
      if (configuration.jsonIdKeyAlias !== null) {
        const idDatatype = new StructureModelComplexType();
        idDatatype.dataType = new StructureModelClass();
        idDatatype.dataType.specification = structureClass.specification;
        if (structureClass.regex) {
          idDatatype.dataType.regex = structureClass.regex;
        }
        if (structureClass.example && structureClass.example.length > 0) {
          idDatatype.dataType.example = structureClass.example as string[];
        }

        const id = new StructureModelProperty();
        id.technicalLabel = configuration.jsonIdKeyAlias;
        id.cardinalityMax = 1;
        id.dataTypes = [idDatatype];
        structureClass.properties.unshift(id);
      }
    }
  }
  return result;
}