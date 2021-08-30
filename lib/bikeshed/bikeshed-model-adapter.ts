import {ObjectModelSchema} from "../object-model";
import {Bikeshed, BikeshedMetadataKeys} from "./bikeshed-model";
import {
  defaultStringSelector,
  objectModelToWebSpecification,
  defaultRootSelector,
  DefaultLinkFactory,
  WebSpecification,
} from "../web-specification";

export function objectModelToBikeshed(schema: ObjectModelSchema): Bikeshed {
  const result = new Bikeshed();
  const specification = objectModelToWebSpecification(
    schema, defaultRootSelector, defaultStringSelector,
    new DefaultLinkFactory(schema));
  result.humanLabel = specification.humanLabel;
  result.humanDescription = specification.humanDescription;
  result.schemas = specification.schemas;
  result.metadata = loadBikeshedMetadata(schema, specification);
  return result;
}

function loadBikeshedMetadata(
  schema: ObjectModelSchema, specification: WebSpecification
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
