import { ShaclModel, ShaclNodeKind, ShaclPropertyShape } from "./shacl-model/shacl-model.ts";
import { ProfileModel } from "./profile-model/profile-model.ts";
import { SemanticModel } from "./semantic-model/semantic-model.ts";
import { semanticModelToLightweightOwl } from "./lightweight-owl/index.ts";
import { createContext, entityListContainerToConceptualModel } from "@dataspecer/core-v2/semantic-model/data-specification-vocabulary";
import { createStructureModel, StructureClass, StructureProperty } from "./structure-model/index.ts";
import { isComplexType, isPrimitiveType } from "@dataspecer/core-v2/semantic-model/datatypes";

/**
 * {@link topProfileModel} must be part of {@link profileModels}.
 */
export function createShaclForProfile(
  semanticModels: SemanticModel[],
  profileModels: ProfileModel[],
  topProfileModel: ProfileModel,
): ShaclModel {

  // Prepare Lightweight OWL.
  const owl = semanticModels.map(
    item => semanticModelToLightweightOwl(item, { idDefinedBy: "" }));

  // Prepare Data Specification Vocabulary.

  const semanticList = semanticModels.map(model => ({
    baseIri: "",
    entities: Object.values(model.getEntities()),
  }));

  const profileList = profileModels.map(model => ({
    baseIri: "",
    entities: Object.values(model.getEntities()),
  }));

  const context = createContext([...semanticList, ...profileList]);
  const dsv = profileList.map(
    item => entityListContainerToConceptualModel("", item, context));

  // Prepare structure model.
  const topDsv = entityListContainerToConceptualModel("", {
    baseIri: "",
    entities: Object.values(topProfileModel.getEntities()),
  }, context);

  const inclusionFilter = topDsv.profiles.map(item => item.iri);
  const structure = createStructureModel(
    owl, dsv, identifier => inclusionFilter.includes(identifier));

  // console.log("Structure model:");
  // console.log(JSON.stringify(structure, null, 2));

  // Prepare SHACL model.
  const result: ShaclModel = {
    // Determine the base URL
    iri: "http://example.com/shacl#",
    members: [],
  };

  const classMap: Record<string, StructureClass> = {};
  structure.classes.forEach(item => classMap[item.iri] = item);

  // For each entity we build a property shapes.
  for (const entity of structure.classes) {
    const propertyShapes = buildPropertyShapes(
      classMap, entity.properties, entity.iri);
    // We need shape for every type.
    for (const type of entity.types) {
      result.members.push({
        // TODO We need to incorporate type somehow ..
        iri: result.iri + encodeURI(type),
        targetClass: type,
        closed: false,
        propertyShapes,
      });
    }
  }

  // As the next step we need to deal with specializations.
  // For C dsv:specializes P, we need to run all validations from P on C.
  for (const child of structure.classes) {
    for (const iri of child.specializationOf) {
      const parent = classMap[iri];
      if (parent === undefined) {
        continue;
      }
      // TODO Deal with specialization
    }
  }

  // SHACL model

  // console.log("SHACL model:");
  // console.log(JSON.stringify(result, null, 2));

  return result;
}

function buildPropertyShapes(
  classMap: Record<string, StructureClass>,
  properties: StructureProperty[],
  baseUrl: string,
): ShaclPropertyShape[] {
  const result: ShaclPropertyShape[] = [];
  for (const property of properties) {
    for (const predicate of property.predicates) {
      for (const range of property.range) {
        const isComplex = isComplexType(range);
        const isPrimitive = isPrimitiveType(range);
        if (isPrimitive && !isComplex) {
          // Primitive is simple, we have just one value.
          result.push({
            iri: range, // TODO
            seeAlso: property.iri,
            description: property.usageNote,
            name: property.name,
            nodeKind: ShaclNodeKind.Literal,
            path: predicate,
            minCount: property.rangeCardinality.min,
            maxCount: property.rangeCardinality.max,
            datatype: range,
            class: null,
          });
        } else if (!isPrimitive && isComplex) {
          // Complex is a reference to a class, which
          // can have multiple types.
          const structureClass = classMap[range];
          if (structureClass === undefined) {
            continue;
          }
          for (const type of structureClass.types) {
            result.push({
              iri: range, // TODO
              seeAlso: property.iri,
              description: property.usageNote,
              name: property.name,
              nodeKind: ShaclNodeKind.BlankNodeOrIRI,
              path: predicate,
              minCount: property.rangeCardinality.min,
              maxCount: property.rangeCardinality.max,
              datatype: null,
              class: type,
            });
          }
        } else {
          // Both ...
          // TODO: How to validate?
        }
      }
    }
  }
  return result;
}

// dsv:specializes <https://mff-uk.github.io/specifications/dcat-dap/#Dataset>;
// mělo by to mít ten efekt že se zvaliduje na childu i to co platí pro parenta.
// Buď nalinkováním parent property shapů, nebo duplikací.
