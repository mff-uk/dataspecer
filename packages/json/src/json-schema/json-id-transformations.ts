import {StructureModel, StructureModelClass, StructureModelComplexType, StructureModelProperty} from "@dataspecer/core/structure-model/model";
import {clone} from "@dataspecer/core/core";
import {JsonConfiguration} from "../configuration";

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
        structureClass.properties.unshift(
          getShadowIdProperty(structureClass.specification,
            configuration.jsonTypeKeyAlias)
        );
      }
      if (configuration.jsonIdKeyAlias !== null) {
        structureClass.properties.unshift(
          getShadowIdProperty(structureClass.specification,
            configuration.jsonIdKeyAlias)
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
