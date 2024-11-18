import {
  DataSpecificationArtefact
} from "@dataspecer/core/data-specification/model";
import { XmlSchema, XmlSchemaComplexContainer, XmlSchemaComplexContentElement, XmlSchemaComplexType, XmlSchemaElement } from "./xml-schema-model";
import { ConceptualModel } from "@dataspecer/core";

export async function createRespecSchema(
  documentationArtifact: DataSpecificationArtefact,
  xmlSchema: XmlSchema,
  conceptualModel: ConceptualModel,
): Promise<Record<string, any>> {
  function enrichAnnotation(annotation: any) {
    if (annotation?.modelReference) {
      let foundObject = null;
      for (const cls of Object.values(conceptualModel.classes)) {
        if (cls.cimIri === annotation.modelReference) {
          foundObject = cls;
          break;
        }
        for (const prop of cls.properties) {
          if (prop.cimIri === annotation.modelReference) {
            foundObject = prop;
            break;
          }
        }
      }
      annotation.class = foundObject;
    }
  }

  const allElements = [];
  let ref = 0;
  function traverseElements(path: XmlSchemaElement[], thisElement: XmlSchemaElement) {
    if (path.includes(thisElement)) {
      return;
    }
    if (allElements.includes(thisElement)) {
      return;
    }

    // @ts-ignore
    thisElement.path = [...path];
    if (thisElement.annotation) {
      enrichAnnotation(thisElement.annotation);
    }
    if (thisElement.type?.annotation) {
      enrichAnnotation(thisElement.type.annotation);
    }
    allElements.push(thisElement);

    path.push(thisElement);
    const maybeComplexDefinition = (thisElement.type as XmlSchemaComplexType | undefined)?.complexDefinition;
    const maybeContents = (maybeComplexDefinition as XmlSchemaComplexContainer | undefined)?.contents;
    for (const content of maybeContents ?? []) {
      const maybeElement = (content as XmlSchemaComplexContentElement | undefined)?.element;
      if (maybeElement) {
        traverseElements(path, maybeElement);
      }
    }
    path.pop();
  };

  for (const root of xmlSchema.elements) {
    traverseElements([], root);
  }

  return {
    xmlSchema,
    xmlSchemaElements: allElements,
    useTemplate: () => (template, render) => {
      return render(`<section>
<h3>Přehled XML struktury</h3>
<p>
  Popis XSD zachycující strukturu pro <i>{{#humanLabel}}{{translate}}{{/humanLabel}}</i> je definováno
  v souboru <a href="{{{artifact.json-schema.relativePath}}}"><code>{{artifact.json-schema.relativePath}}</code></a>.
</p>

{{#xmlSchema.targetNamespace}}
  <dt>Namespace</dt>
  <dd><a href="{{{.}}}">{{{.}}}</a> (prefix: {{{xmlSchema.targetNamespacePrefix}}})</dd>
{{/xmlSchema.targetNamespace}}

<dt>Importy</dt>
{{#xmlSchema.imports}}
  <dd>
    {{#prefix}}
    <strong>Prefix:</strong> {{.}}<br>
    {{/prefix}}
    {{#namespace}}
    <strong>Namespace:</strong> {{.}}<br>
    {{/namespace}}
    <strong>Schema Location:</strong> {{schemaLocation}}
  </dd>
{{/xmlSchema.imports}}
{{^xmlSchema.imports}}
<i>Nic není importováno.</i>
{{/xmlSchema.imports}}


{{#xmlSchemaElements}}
<section>
  <h4>Element {{^elementName.0}}{{#path}}<code>{{elementName.1}}</code> / {{/path}}{{/elementName.0}}<code>{{elementName.1}}</code></h4>
  {{#annotation.documentation}}
  <dt>Dokumentace elementu</dt>
  <dd>{{.}}</dd>
  {{/annotation.documentation}}
  {{#annotation.class}}
  <dt>Interpretace</dt>
  <dd><a href="#{{semanticModelLinkId}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a></dd>
  {{/annotation.class}}
  {{#type.annotation.documentation}}
  <dt>Dokumentace typu elementu</dt>
  <dd>{{.}}</dd>
  {{/type.annotation.documentation}}
  {{#type.annotation.class}}
  <dt>Interpretace</dt>
  <dd><a href="#{{semanticModelLinkId}}">{{#humanLabel}}{{translate}}{{/humanLabel}}</a></dd>
  {{/type.annotation.class}}
</section>
{{/xmlSchemaElements}}

</section>
`);
    },
  };
}
