import { ConceptualModel } from "@dataspecer/core";
import {
  DataSpecification,
  DataSpecificationArtefact,
} from "@dataspecer/core/data-specification/model";
import {
  XmlSchema,
  XmlSchemaAnnotation,
  XmlSchemaComplexContainer,
  xmlSchemaComplexContentIsElement,
  xmlSchemaComplexContentIsItem,
  XmlSchemaComplexItem,
  XmlSchemaElement,
  XmlSchemaGroupDefinition,
  XmlSchemaType,
  xmlSchemaTypeIsComplex,
} from "./xml-schema-model";
import { HandlebarsAdapter } from "@dataspecer/handlebars-adapter";
import { getMustacheView } from "@dataspecer/template-artifact";
import { ArtefactGeneratorContext } from "@dataspecer/core/generator/artefact-generator-context";
import { pathRelative } from "@dataspecer/core/core/utilities/path-relative";
import { QName } from "../conventions";

/**
 * Recursively traverses the complex content container and returns all elements.
 */
function traverseXmlSchemaComplexContainer(container: XmlSchemaComplexContainer, path: XmlSchemaElement[] = []): XmlSchemaElement[] {
  const elements = [] as XmlSchemaElement[];
  for (const content of container.contents) {
    // It can be element or item
    if (xmlSchemaComplexContentIsElement(content)) {
      const element = content.element;
      const skipElement = element.elementName[0] === "c" && element.elementName[1] === "iri";
      if (!skipElement) {
        elements.push(element);
      }
      // @ts-ignore
      element.path = [...path];

      path.push(element);
      elements.push(...traverseXmlSchemaElement(element, path));
      path.pop();
    } else if (xmlSchemaComplexContentIsItem(content)) {
      elements.push(...traverseXmlSchemaComplexItem(content.item, path));
    }
  }
  return elements;
}
function traverseXmlSchemaType(type: XmlSchemaType, path: XmlSchemaElement[] = []): XmlSchemaElement[] {
  const elements = [] as XmlSchemaElement[];
  if (xmlSchemaTypeIsComplex(type)) {
    const complexItem = type.complexDefinition;
    if ((complexItem as XmlSchemaComplexContainer).contents) {
      const anotherContainer = complexItem as XmlSchemaComplexContainer;
      elements.push(...traverseXmlSchemaComplexContainer(anotherContainer, path));
    }
  }
  return elements;
}
function traverseXmlSchemaElement(element: XmlSchemaElement, path: XmlSchemaElement[] = []): XmlSchemaElement[] {
  return traverseXmlSchemaType(element.type, path);
}
function traverseXmlSchemaComplexItem(complexItem: XmlSchemaComplexItem, path: XmlSchemaElement[] = []): XmlSchemaElement[] {
  const elements = [] as XmlSchemaElement[];
  if ((complexItem as XmlSchemaComplexContainer).contents) {
    const container = complexItem as XmlSchemaComplexContainer;
    elements.push(...traverseXmlSchemaComplexContainer(container, path));
  }
  return elements;
}

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

  private getElementUniqueId(element: XmlSchemaElement | XmlSchemaType | XmlSchemaGroupDefinition | QName | string, type: string | undefined): string {
    if (!type && typeof element === "object") {
      if ((element as XmlSchemaElement).elementName) {
        type = "element";
      } else if ((element as XmlSchemaGroupDefinition).definition) {
        type = "group";
      } else {
        type = "type";
      }
    }

    if (typeof element === "string") {
      return type + "-" + element;
    } else if (Array.isArray(element)) {
      const ns = element[0] ? `${element[0]}:` : "";
      return `${type}-${ns}${element[1]}`;
    } else {
      const name = (element as XmlSchemaElement).elementName ?? (element as XmlSchemaType).name ?? (element as XmlSchemaGroupDefinition).name;

      if (typeof name === "string") {
        return type + "-" + name;
      }

      const ns = name[0] ? `${name[0]}:` : "";
      return `${type}-${ns}${name[1]}`;
    }
  }

  async generateToString(): Promise<string> {
    const prefixToNamespace = {} as Record<string, string>;
    for (const imp of this.xmlSchema.imports) {
      prefixToNamespace[imp.prefix] = imp.namespace + "#";
    }
    prefixToNamespace["xs"] = "https://www.w3.org/TR/xmlschema-2/#";

    this.generator.engine.registerHelper("xml-id-anchor", (element: XmlSchemaElement | XmlSchemaType | XmlSchemaGroupDefinition | QName | string, options: any) => {
      return this.getElementUniqueId(element, options.hash.type);
    });
    this.generator.engine.registerHelper("xml-href", (element: XmlSchemaElement | XmlSchemaType | XmlSchemaGroupDefinition | QName | string, options: any) => {
      const possibleOutsideReferenceName = (element as XmlSchemaElement).elementName ?? (element as XmlSchemaType).name ?? element as QName;
      if (Array.isArray(possibleOutsideReferenceName) && possibleOutsideReferenceName[0] !== null && this.xmlSchema.targetNamespacePrefix !== possibleOutsideReferenceName[0]) {
        // This is link to external element
        return prefixToNamespace[possibleOutsideReferenceName[0]] + possibleOutsideReferenceName[1];
      }
      return "#" + this.getElementUniqueId(element, options.hash.type);
    });

    this.generator.engine.registerHelper("get-semantic-class", (annotation: XmlSchemaAnnotation | null, options: any) => {
      if (!annotation?.modelReference) {
        return null;
      }
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
      if (foundObject) {
        return options.fn?.(foundObject) ?? foundObject;
      } else {
        return null;
      }
    });

    this.generator.compile(DEFAULT_TEMPLATE);
    const data = await this.prepareData();
    return this.generator.render(data);
  }

  async prepareData(): Promise<Record<string, any>> {
    const rootElements = [] as (XmlSchemaElement & {
      linkedChildElements: any[],
    })[];
    const rootGroups = [] as (XmlSchemaGroupDefinition & {
      linkedChildElements: any[],
    })[];
    const rootTypes = [] as (XmlSchemaType & {
      linkedChildElements: any[],
    })[];

    for (const element of this.xmlSchema.elements) {
      rootElements.push({
        ...element,
        linkedChildElements: traverseXmlSchemaElement(element, [element]),
      });
    }

    for (const group of this.xmlSchema.groups) {
      rootGroups.push({
        ...group,
        linkedChildElements: traverseXmlSchemaComplexItem(group.definition),
      });
    }

    for (const type of this.xmlSchema.types) {
      rootTypes.push({
        ...type,
        linkedChildElements: traverseXmlSchemaType(type),
      });
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
      const model = imp.model;
      const schema = model?.roots[0].classes[0].structureSchema;
      imports.push({
        prefix: imp.prefix,
        namespace: imp.namespace,
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

    return {
      xmlSchema: this.xmlSchema,
      ...data,
      imports,
      // @ts-ignore
      structureModel: data.structureModels.find(m => m.psmIri === this.artefact.psm),

      rootElements,
      rootGroups,
      rootTypes,
    };
  }
}

// todo: It is expected that this variable will be moved to a separate file in the future
export const DEFAULT_TEMPLATE = `
{{#def "xml-meaning" "annotation"}}
  {{#if (or (get-semantic-class annotation) (non-empty annotation.metaTitle) (non-empty annotation.metaDescription))}}
    <dt>Význam</dt>
    {{#if (or (non-empty annotation.metaTitle) (non-empty annotation.metaDescription))}}
    <dd style="font-style: italic;">
      {{translate annotation.metaTitle}}

      {{#if (and (non-empty annotation.metaTitle) (non-empty annotation.metaDescription))}} - {{/if}}

      {{translate annotation.metaDescription}}
      </dd>
    {{/if}}
    <dd>V konceptuálním odpovídá pojmu <a href="#{{#get-semantic-class annotation}}{{@root/semanticModelLinkId}}{{/get-semantic-class}}">{{#get-semantic-class annotation}}{{translate humanLabel}}{{/get-semantic-class}}</a>.</dd>
  {{/if}}
{{/def}}

{{#def "xml-qname" "name"}}{{#if name.[0]}}{{name.[0]}}:{{/if}}{{name.[1]}}{{/def}}

{{#def "xml-content-type" "type"}}
{{#if (equals type "choice")}} - výběr jednoho elementu z množiny{{/if}}
{{#if (equals type "sequence")}} - elementy v tomto pořadí{{/if}}
{{/def}}

{{#def "xml-complex-definition" "complexDefinition"}}
  {{#if complexDefinition.contents}}
    <dt>Obsah {{xml-content-type complexDefinition.xsType}}</dt>
    <ul style="margin-top: 0;">
    {{#complexDefinition.contents}}
      <li>
        {{#if element}}
          element <a href="{{xml-href element}}"><code>&lt;{{element.elementName.[1]}}&gt;</code></a>
        {{/if}}
        {{#item}}
          {{#if (equals xsType "group")}}
            skupina <a href="{{xml-href name type="group"}}"><code>{{xml-qname name}}</code></a>
          {{else}}
            {{xml-type}}
          {{/if}}
        {{/item}}

        [{{cardinalityMin}}..{{#if cardinalityMax}}{{cardinalityMax}}{{else}}*{{/if}}]
      </li>
    {{/complexDefinition.contents}}
    </ul>
  {{/if}}
{{/def}}

{{#def "xml-type"}}
  <div style="margin-left: 1rem;">
    {{#if name}}
      <dt>Obsah</dt>
      <dd>
        Obsahem elementu je typ <a href="{{xml-href name}}"><code>{{xml-qname name}}</code></a>.
      </dd>
    {{/if}}

    {{#simpleDefinition}}
      <dt>Obsah</dt>
      {{#if (equals xsType "restriction")}}
        <dd>
        Obsahem elementu je jednoduchý typ <code>{{xml-qname base}}</code> s omezením na hodnoty dané regulárním výrazem <code>{{pattern}}</code>.
        </dd>
      {{else}}
        <dd>
          Obsahem elementu je jednoduchý typ <code>{{xml-qname xsType}}</code>.
        </dd>
      {{/if}}
    {{/simpleDefinition}}

    {{xml-meaning annotation}}

    {{#complexDefinition}}
      {{#if name}}
        <dt>Název</dt>
        <dd>
          <code>{{xml-qname name}}</code>
        </dd>
      {{/if}}
      {{#if contents}}
        <dt>Obsah {{xml-content-type xsType}}</dt>
        <ul style="margin-top: 0;">
        {{#contents}}
          <li>
            {{#if element}}
              element <a href="{{xml-href element}}"><code>&lt;{{element.elementName.[1]}}&gt;</code></a>
            {{/if}}
            {{#item}}
              {{xml-type}}
            {{/item}}

            [{{cardinalityMin}}..{{#if cardinalityMax}}{{cardinalityMax}}{{else}}*{{/if}}]
          </li>
        {{/contents}}
        </ul>
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
  <dd><code><a href="{{.}}">{{.}}</a></code> (preferovaný prefix: <code>{{@root.xmlSchema.targetNamespacePrefix}}</code>)</dd>
{{/xmlSchema.targetNamespace}}

<section>
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

<section>
  <h4>Kořenové entity XSD schématu</h4>
  <ul>
    {{#xmlSchema.elements}}
      <li> element <a href="{{xml-href .}}"><code>{{xml-qname elementName}}</code></a></li>
    {{/xmlSchema.elements}}

    {{#xmlSchema.groups}}
      <li> skupina <a href="{{xml-href .}}"><code>{{name}}</code></a></li>
    {{/xmlSchema.groups}}

    {{#xmlSchema.types}}
      <li> typ <a href="{{xml-href .}}"><code>{{xml-qname name}}</code></a></li>
    {{/xmlSchema.types}}
  </ul>
</section>



{{#def "xml-non-root-element" "element"}}
<section id="{{xml-id-anchor .}}">
  <h4>Element {{^elementName.[0]}}{{#path}}<code>&lt;{{elementName.[1]}}&gt;</code> / {{/path}}{{/elementName.[0]}}<code>&lt;{{elementName.[1]}}&gt;</code></h4>
  {{xml-meaning annotation}}

  {{#if type}}{{#with type}}
    <h4 style="margin-top: 0; margin-bottom: .5rem;">Typ elementu</h4>
    {{xml-type}}
  {{/with}}{{else}}
    <i>Element nemá definovaný typ.</i>
  {{/if}}
</section>
{{/def}}

{{#rootElements}}
<section id="{{xml-id-anchor .}}">
  <h4>Kořenový element {{^elementName.[0]}}{{#path}}<code>&lt;{{elementName.[1]}}&gt;</code> / {{/path}}{{/elementName.[0]}}<code>&lt;{{elementName.[1]}}&gt;</code></h4>
  {{xml-meaning annotation}}

  {{#if type}}{{#with type}}
    <h4 style="margin-top: 0; margin-bottom: .5rem;">Typ elementu</h4>
    {{xml-type}}
  {{/with}}{{else}}
    <i>Element nemá definovaný typ.</i>
  {{/if}}
</section>
{{#linkedChildElements}}{{xml-non-root-element .}}{{/linkedChildElements}}
{{/rootElements}}

{{#rootGroups}}
<section id="{{xml-id-anchor .}}">
  <h4>Kořenová skupina {{#if name}}<code>{{name}}</code>{{else}}bez pojmenování{{/if}}</h4>

  {{xml-complex-definition definition}}
</section>
{{#linkedChildElements}}{{xml-non-root-element .}}{{/linkedChildElements}}
{{/rootGroups}}

{{#rootTypes}}
<section id="{{xml-id-anchor .}}">
  <h4>Kořenový typ {{#if name}}<code>{{xml-qname name}}</code>{{else}}bez pojmenování{{/if}}</h4>

  {{xml-meaning annotation}}

  {{xml-complex-definition complexDefinition}}
</section>
{{#linkedChildElements}}{{xml-non-root-element .}}{{/linkedChildElements}}
{{/rootTypes}}
`;


// obsahem je primitivní hodnota typu integer
