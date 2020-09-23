import {
  ModelResource,
  ModelResourceType,
  PsmSchema,
  PsmClass,
  PsmPart,
  PimAttribute,
  PimClass,
  PimReference
} from "../platform-model/platform-model";

type ResourceMap = Record<string, ModelResource>;

/**
 * Does not utilize scoped context.
 */
export function produceFlatJsonLdContext(
  entities: ResourceMap, entity: ModelResource,
  prefixes: Record<string, string>
) {

  if (!entity.types.includes(ModelResourceType.PsmSchema)) {
    throw Error("JsonLd Context generator can be used only with psm Schema.")
  }

  const result = { // Some hard coded options.
    "@version": 1.1,
    "iri": "@id",
    "typ": "@type",
    ...prefixes,
  };

  const schema = entity as PsmSchema;
  for (const iri of schema.psmRoots) {
    const root = entities[iri];
    if (!root.types.includes(ModelResourceType.PsmClass)) {
      continue;
    }
    const rootContext = produceForClass(entities, prefixes, root as PsmClass);
    mergeToLeft(result, rootContext);
  }

  return {"@context": result};
}

function produceForClass(
  entities: ResourceMap, prefixes: Record<string, string>, root: PsmClass
) {
  const result = {};
  // TODO root.psmExtends
  for (const partIri of root.psmParts) {
    const part = entities[partIri];
    if (!part.types.includes(ModelResourceType.PsmPart)) {
      continue;
    }
    const interpretations = collectInterpretations(entities, part);
    mergeToLeft(result, transform(entities, prefixes, interpretations))
  }
  return result;
}

/**
 * Return all interpretations recursively. Each object
 * must have only one interpretation.
 */
function collectInterpretations(
  entities: ResourceMap, entity: ModelResource
): ModelResource[] {
  const result = [];
  let last = entity;
  while (last !== undefined) {
    let next = undefined;
    if (last["psmInterpretation"] && last["pimInterpretation"]) {
      throw new Error(`Multiple interpretations found for ${last.id}`);
    }
    if (last["psmInterpretation"]) {
      next = entities[last["psmInterpretation"]];
    } else if (last["pimInterpretation"]) {
      next = entities[last["pimInterpretation"]];
    }
    result.push(last);
    last = next;
  }
  return result;
}

function transform(
  entities: ResourceMap, prefixes: Record<string, string>,
  resources: ModelResource[]
) {
  const technicalLabel = getFirstPropertyValue(
    resources, ["psmTechnicalLabel", "pimTechnicalLabel"]);
  const dataType = getFirstPropertyValue(
    resources, ["pimDatatype"]);
  const iri = resources[resources.length - 1].id;
  const ofn = getOfnLink(entities, resources);

  const result = {
    "@id": applyPrefix(prefixes, iri),
  };

  if (ofn === undefined) {
    applyDataType(result, dataType);
  } else {
    result["@context"] = ofn;
  }

  return {[technicalLabel]: result}
}

/**
 * Iterate given resources, return first defined value of property.
 */
function getFirstPropertyValue(
  resources: ModelResource[], properties: string[]
): any {
  for (const resource of resources) {
    for (const property of properties) {
      if (resource[property] !== undefined) {
        return resource[property];
      }
    }
  }
}

function getOfnLink(
  entities: ResourceMap, resources: ModelResource[]
): string | undefined {
  const parts = getFirstPropertyValue(resources, ["psmParts", "pimParts"]);
  if (parts === undefined || parts.length === 0) {
    return undefined;
  }
  if (parts.length > 1) {
    throw new Error(`Only one part expected: ${parts}`)
  }
  const partResource: ModelResource = entities[parts[0]];
  if (partResource.types.includes(ModelResourceType.PsmSchema)) {
    return (partResource as PsmSchema).psmOfn;
  }
  return undefined;
}

function applyPrefix(prefixes: Record<string, string>, iri: string): string {
  for (const [key, prefix] of Object.entries(prefixes)) {
    if (iri.startsWith(prefix)) {
      return key + ":" + iri.substr(prefix.length);
    }
  }
  return iri;
}

function applyDataType(context: object, dataType: string): void {
  if (dataType === "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString") {
    context["@container"] = "@language";
  }
}

function mergeToLeft(destination, source) {
  for (const [key, value] of Object.entries(source)) {
    if (destination[key] === undefined) {
      destination[key] = value;
    } else {
      throw new Error(`Collision detected for ${key}`);
    }
  }
}