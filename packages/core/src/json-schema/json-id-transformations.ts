import {StructureModel, StructureModelClass, StructureModelComplexType, StructureModelProperty} from "../structure-model/model";
import {clone} from "../core";
import {JsonSchemaGeneratorOptions} from "./json-schema-generator-options";

/**
 * For each PSM class with CIM interpretation, it adds iri and type property
 * based on generator configuration.
 * @see https://github.com/mff-uk/dataspecer/issues/245
 */
export function structureModelAddIdAndTypeProperties(
  structure: StructureModel,
  configuration: JsonSchemaGeneratorOptions,
): StructureModel {
  const result = clone(structure) as StructureModel;
  const classes = result.getClasses();
  for (const structureClass of classes) {
    // todo: properties are added only to non-empty classes as empty are treated differently
    if (structureClass.cimIri !== null && structureClass.properties.length > 0) {
      if (configuration.interpretedClassTypePropertyName !== null) {
        structureClass.properties.unshift(
          getShadowIdProperty(structureClass.specification,
            configuration.interpretedClassTypePropertyName)
        );
      }
      if (configuration.interpretedClassIriPropertyName !== null) {
        structureClass.properties.unshift(
          getShadowIdProperty(structureClass.specification,
            configuration.interpretedClassIriPropertyName)
        );
      }
    }
  }
  return result;
}

function getShadowIdProperty(specification: string, technicalLabel: string) {
  const idDatatype = new StructureModelComplexType();
  idDatatype.dataType = new StructureModelClass();
  idDatatype.dataType.specification = specification;

  const id = new StructureModelProperty();
  id.technicalLabel = technicalLabel;
  id.cardinalityMax = 1;
  id.dataTypes = [idDatatype]

  return id;
}
