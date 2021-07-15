import {SchemaData} from "../../entity-model/entity-model";
import {ReSpec, ReSpecMetadata} from "./respec-model";
import {
  defaultStringSelector,
  webSpecification,
  RootClassSelector,
  defaultRootSelector,
  DefaultLinkFactory,
} from "../web-specification/web-specification-model-adapter";

export function schemaAsReSpec(schema: SchemaData): ReSpec {
  const result = new ReSpec();
  result.metadata = loadReSpecMetadata(schema);
  const specification = webSpecification(
    schema, createRootSelector(schema), defaultStringSelector,
    new ReSpecLinkFactory(schema));
  result.humanLabel = specification.humanLabel;
  result.humanDescription = specification.humanDescription;
  result.schemas = specification.schemas;
  return result;
}

function createRootSelector(schema: SchemaData): RootClassSelector {
  return classData => classData.schema == schema
    || defaultRootSelector(classData);
}

function loadReSpecMetadata(schema: SchemaData): ReSpecMetadata {
  return {
    "title": defaultStringSelector(schema.humanLabel),
  };
}

class ReSpecLinkFactory extends DefaultLinkFactory {

  protected schemaLink(schema: SchemaData) {
    let result = schema.psmIri;
    if (!result.endsWith("/")) {
      result += "/";
    }
    result += "respec";
    return result;
  }

}
