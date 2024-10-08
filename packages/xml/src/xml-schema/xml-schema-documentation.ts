import { ConceptualModel } from "@dataspecer/core";
import {
  DataSpecification,
  DataSpecificationArtefact,
} from "@dataspecer/core/data-specification/model";
import {
  XmlSchema,
  XmlSchemaComplexContainer,
  XmlSchemaComplexContentElement,
  XmlSchemaComplexType,
  XmlSchemaElement,
} from "./xml-schema-model";
import { HandlebarsAdapter } from "@dataspecer/handlebars-adapter";
import { getMustacheView } from "@dataspecer/template-artifact";
import { ArtefactGeneratorContext } from "@dataspecer/core/generator/artefact-generator-context";
import { pathRelative } from "@dataspecer/core/core/utilities/path-relative";

export function generateDocumentation(
  documentationArtifact: DataSpecificationArtefact,
  xmlSchema: XmlSchema,
  conceptualModel: ConceptualModel,
  context: ArtefactGeneratorContext,
  artefact: DataSpecificationArtefact,
  specification: DataSpecification
): Promise<string> {
  const generator = new XmlSchemaDocumentationGenerator(
    documentationArtifact,
    xmlSchema,
    conceptualModel,
    context,
    artefact,
    specification
  );
  return generator.generateToString();
}

class XmlSchemaDocumentationGenerator {
  private documentationArtifact: DataSpecificationArtefact;
  private xmlSchema: XmlSchema;
  private conceptualModel: ConceptualModel;
  private context: ArtefactGeneratorContext;
  private artefact: DataSpecificationArtefact;
  private specification: DataSpecification;
  generator: HandlebarsAdapter;

  constructor(
    documentationArtifact: DataSpecificationArtefact,
    xmlSchema: XmlSchema,
    conceptualModel: ConceptualModel,
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification
  ) {
    this.documentationArtifact = documentationArtifact;
    this.xmlSchema = xmlSchema;
    this.conceptualModel = conceptualModel;
    this.context = context;
    this.artefact = artefact;
    this.specification = specification;

    this.generator = new HandlebarsAdapter();
  }

  async generateToString(): Promise<string> {
    this.generator.compile(DEFAULT_TEMPLATE);
    const data = await this.prepareData();
    return this.generator.render(data);
  }

  async prepareData(): Promise<Record<string, any>> {
    const enrichAnnotation = (annotation: any) => {
      if (annotation?.modelReference) {
        let foundObject = null;
        for (const cls of Object.values(this.conceptualModel.classes)) {
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
    };

    const allElements = [];
    function traverseElements(
      path: XmlSchemaElement[],
      thisElement: XmlSchemaElement
    ) {
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
      const maybeComplexDefinition = (
        thisElement.type as XmlSchemaComplexType | undefined
      )?.complexDefinition;
      const maybeContents = (
        maybeComplexDefinition as XmlSchemaComplexContainer | undefined
      )?.contents;
      for (const content of maybeContents ?? []) {
        const maybeElement = (
          content as XmlSchemaComplexContentElement | undefined
        )?.element;
        if (maybeElement) {
          traverseElements(path, maybeElement);
        }
      }
      path.pop();
    }

    for (const root of this.xmlSchema.elements) {
      traverseElements([], root);
    }

    const classSpecificationArtifact = (schema: string) => {
      const specification = Object.values(this.context.specifications).find(
        (s) => s.psms.includes(schema)
      ).iri;

      const artefact = this.context.specifications[
        specification
      ].artefacts.find(
        (a) =>
          a.generator ===
          "https://schemas.dataspecer.com/generator/template-artifact"
      );
      return {
        link: pathRelative(
          this.artefact.publicUrl,
          artefact.publicUrl
        ),
        semanticModel:
          this.context.conceptualModels[
            this.context.specifications[specification].pim
          ],
      };
    };

    const imports = [];
    for (const imp of this.xmlSchema.imports) {
      const model = await imp.model;
      const schema = model?.roots[0].classes[0].structureSchema;
      imports.push({
        prefix: await imp.prefix,
        namespace: await imp.namespace,
        schemaLocation: imp.schemaLocation,
        documentation: schema ? classSpecificationArtifact(schema) : null,
      });
    }

    // todo: It uses data from the template-artifact package
    const data = getMustacheView({
      context: this.context,
      artefact: this.documentationArtifact,
      specification: this.specification,
    });

    console.log("🍓 XML SCHEMA", this.xmlSchema);

    return {
      xmlSchema: this.xmlSchema,
      xmlSchemaElements: allElements,
      ...data,
      imports,
      // @ts-ignore
      structureModel: data.structureModels.find(m => m.psmIri === this.artefact.psm),
    };
  }
}

// todo: It is expected that this variable will be moved to a separate file in the future
export const DEFAULT_TEMPLATE = `
{{#def "xml-type"}}
  <div style="margin-left: 1rem;">
  <dt>Název typu</dt>
    <dd>
      {{#if name}}
        <code>{{#if name.[0]}}{{name.[0]}}:{{/if}}{{name.[1]}}</code>:
      {{else}}
        <i>Bez názvu</i>:
      {{/if}}
    </dd>

    {{#annotation.documentation}}
      <dt>Dokumentace elementu</dt>
      <dd>{{.}}</dd>
    {{/annotation.documentation}}

    {{#annotation.class}}
      <dt>Interpretace</dt>
      <dd><a href="#{{@root/semanticModelLinkId}}">{{translate humanLabel}}</a></dd>
    {{/annotation.class}}

    {{#complexDefinition}}
      <dt>Jako komplexní typ je použito</dt>
      <dd>
        <code>{{xsType}}</code>
      </dd>

      {{#if contents}}
        <dt>Obsah</dt>
        <dd>
          <ul>
          {{#contents}}
            <li>
              {{#if element}}
                <code>{{element.elementName.[1]}}</code>
              {{/if}}
              {{#item}}
                {{xml-type}}
              {{/item}}

              [{{cardinalityMin}}..{{#if cardinalityMax}}{{cardinalityMax}}{{else}}*{{/if}}]
            </li>
          {{/contents}}
          </ul>
        </dd>
      {{/if}}
    {{/complexDefinition}}
  </div>
{{/def}}

<section>
<h3>Přehled XML struktury</h3>
<p>
  Tato sekce popisuje XSD zachycující strukturu pro <i>{{translate structureModel.humanLabel}}</i>, jež je definováno
  v souboru <a href="{{{structureModel.artifact.xml-schema.relativePath}}}"><code>{{structureModel.artifact.xml-schema.relativePath}}</code></a>.
</p>

{{#xmlSchema.targetNamespace}}
  <dt>Definováno v namespace</dt>
  <dd><code><a href="{{.}}">{{.}}</a></code> (preferovaný prefix: <code>{{../targetNamespacePrefix}}</code>)</dd>
{{/xmlSchema.targetNamespace}}

<section></section>
<h4>Importy</h4>
<p>
  Seznam schémat, jež jsou tímto schématem importovány a použity.
</p>
{{#if imports}}
  <table class="def">
    <thead>
      <tr>
        <th>Prefix</th>
        <th>Namespace</th>
        <th>Lokace schématu</th>
        <th>Dokumentace</th>
      </tr>
    </thead>
    <tbody>
      {{#imports}}
        <tr>
          {{#if prefix}}
            <td><code></code>{{prefix}}</code></td>
            <td><a href="{{{namespace}}}">{{namespace}}</a></td>
          {{else}}
            <td colspan="2" style="text-align: center;"><i>Stejný namespace jako hlavní dokument</i></td>
          {{/if}}
          <td><a href="{{schemaLocation}}">{{schemaLocation}}</a></td>
          <td>{{#documentation}}<a href="{{link}}">{{translate semanticModel.humanLabel}}</a>{{/documentation}}</td>
        </tr>
      {{/imports}}
    </tbody>
  </table>
{{else}}
<i>Nic není importováno.</i>
{{/if}}
</section>

{{#xmlSchemaElements}}
<section>
  <h4>Element {{^elementName.[0]}}{{#path}}<code>{{elementName.[1]}}</code> / {{/path}}{{/elementName.[0]}}<code>{{elementName.[1]}}</code></h4>

  {{#annotation.class}}
  <dt>Interpretace</dt>
  <dd><a href="#{{@root/semanticModelLinkId}}">{{translate humanLabel}}</a></dd>
  {{/annotation.class}}

  {{#annotation.documentation}}
    <dt>Dokumentace elementu</dt>
    <dd>{{.}}</dd>
  {{/annotation.documentation}}

  {{#if type}}{{#with type}}
    <h4 style="margin-top: 0; color: var(--heading-color);">Typ elementu</h4>
    {{xml-type}}
  {{/with}}{{else}}
    <i>Element nemá definovaný typ.</i>
  {{/if}}

</section>
{{/xmlSchemaElements}}

</section>
`;
