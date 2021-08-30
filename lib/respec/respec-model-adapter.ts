import {ObjectModelSchema} from "../object-model";
import {ReSpec, ReSpecMetadata} from "./respec-model";
import {
  defaultStringSelector,
  objectModelToWebSpecification,
  defaultRootSelector,
  DefaultLinkFactory,
} from "../web-specification";

export function objectModelToReSpec(schema: ObjectModelSchema): ReSpec {
  const result = new ReSpec();
  result.metadata = loadReSpecMetadata(schema);
  const specification = objectModelToWebSpecification(
    schema, defaultRootSelector, defaultStringSelector,
    new ReSpecLinkFactory(schema));
  result.humanLabel = specification.humanLabel;
  result.humanDescription = specification.humanDescription;
  result.schemas = specification.schemas;
  return result;
}

function loadReSpecMetadata(schema: ObjectModelSchema): ReSpecMetadata {
  return {
    "title": defaultStringSelector(schema.humanLabel),
  };
}

class ReSpecLinkFactory extends DefaultLinkFactory {

  protected schemaLink(schema: ObjectModelSchema) {
    let result = schema.psmIri;
    if (!result.endsWith("/")) {
      result += "/";
    }
    result += "respec";
    return result;
  }

}
