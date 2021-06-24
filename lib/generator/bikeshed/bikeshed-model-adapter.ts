import {SchemaData} from "../../entity-model/entity-model";
import {Bikeshed, BikeshedMetadataKeys} from "./bikeshed-model";
import {
  defaultStringSelector,
  webSpecification,
  RootClassSelector,
  defaultRootSelector,
  DefaultLinkFactory,
} from "../web-specification/web-specification-model-adapter";
import {WebSpecification} from "../web-specification/web-specification-model";

export function schemaAsBikeshed(schema: SchemaData): Bikeshed {
  const result = new Bikeshed();
  const specification = webSpecification(
    schema, createRootSelector(schema), defaultStringSelector,
    new BikeshedLinkFactory(schema));
  result.humanLabel = specification.humanLabel;
  result.humanDescription = specification.humanDescription;
  result.schemas = specification.schemas;
  result.metadata = loadBikehedMetadata(schema, specification);
  return result;
}

function createRootSelector(schema: SchemaData): RootClassSelector {
  return classData => classData.schema == schema
    || defaultRootSelector(classData);
}

function loadBikehedMetadata(
  schema: SchemaData, specification: WebSpecification
): Record<string, string> {
  return {
    [BikeshedMetadataKeys.title]: specification.humanLabel,
    [BikeshedMetadataKeys.shortname]: specification.humanLabel,
    [BikeshedMetadataKeys.status]: "LS",
    [BikeshedMetadataKeys.editor]: "Model-Driven Generator",
    [BikeshedMetadataKeys.boilerplate]: "conformance no, copyright no",
    [BikeshedMetadataKeys.abstract]: specification.humanDescription,
    [BikeshedMetadataKeys.markup]: "markdown yes",
  }
}

class BikeshedLinkFactory extends DefaultLinkFactory {

  protected schemaLink(schema: SchemaData) {
    let result = schema.psmIri;
    if (!result.endsWith("/")) {
      result += "/";
    }
    result += "bikeshed";
    return result;
  }

}
