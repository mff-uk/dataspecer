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
  XmlSchemaType,
  xmlSchemaTypeIsComplex,
} from "./xml-schema-model";
import { ArtefactGeneratorContext } from "@dataspecer/core/generator/artefact-generator-context";
import { pathRelative } from "@dataspecer/core/core/utilities/path-relative";
import { QName } from "../conventions";
import { NEW_DOC_GENERATOR } from "./xml-schema-generator";
import { getMustacheView } from "@dataspecer/documentation";
import { HandlebarsAdapter } from "../../../handlebars-adapter/lib/interface";

/**
 * Recursively traverses the complex content container and returns all elements.
 */
function traverseXmlSchemaComplexContainer(container: XmlSchemaComplexContainer, path: (XmlSchemaElement | XmlSchemaType)[] = []): XmlSchemaElement[] {
  const elements = [] as XmlSchemaElement[];
  for (const content of container.contents) {
    // It can be element or item
    if (xmlSchemaComplexContentIsElement(content)) {
      const element = content.element;
      const skipElement = element.name[0] === "c" && element.name[1] === "iri";
      if (!skipElement) {
        elements.push(element);
        // @ts-ignore
        element.effectiveCardinalityFromParentContainer = {
          min: content.effectiveCardinalityMin,
          max: content.effectiveCardinalityMax,
        };

        // Prepare path to parent entity in more human readable form
        const semanticPath = [];
        if (content.semanticRelationToParentElement) {
          for (let i = 0; i < content.semanticRelationToParentElement.length; i++) {
            const step = content.semanticRelationToParentElement[i];
            const nextStep = content.semanticRelationToParentElement[i + 1] ?? null;

            if (step.type === "class") {
              semanticPath.push({
                type: "class",
                entity: step.class,
              })
            } else if (step.type === "property") {
              semanticPath.push({
                type: "property",
                entity: step.property,
              })
            } else if (step.type === "generalization" && nextStep?.type === "class") {
              semanticPath.push({
                type: "generalization",
                entity: nextStep.class,
              });
              i++;
            } else if (step.type === "specialization" && nextStep?.type === "class") {
              semanticPath.push({
                type: "specialization",
                entity: nextStep.class,
              });
              i++;
            }
          }
        }
        // @ts-ignore
        element.pathFromParentEntity = semanticPath;
        // @ts-ignore
        element.parentEntityInDocumentation = path[path.length - 1];
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
function traverseXmlSchemaType(type: XmlSchemaType, path: (XmlSchemaElement | XmlSchemaType)[] = []): XmlSchemaElement[] {
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
function traverseXmlSchemaElement(element: XmlSchemaElement, path: (XmlSchemaElement | XmlSchemaType)[] = []): XmlSchemaElement[] {
  return traverseXmlSchemaType(element.type, path);
}
function traverseXmlSchemaComplexItem(complexItem: XmlSchemaComplexItem, path: (XmlSchemaElement | XmlSchemaType)[] = []): XmlSchemaElement[] {
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
  specification: DataSpecification,
  partial: (template: string) => string,
  adapter: HandlebarsAdapter,
): Promise<object> {
  const generator = new XmlSchemaDocumentationGenerator(
    documentationArtifact,
    xmlSchema,
    conceptualModel,
    context,
    artefact,
    specification,
    partial,
    adapter,
  );
  return generator.generateToObject();
}

class XmlSchemaDocumentationGenerator {
  private documentationArtifact: DataSpecificationArtefact;
  private xmlSchema: XmlSchema;
  private conceptualModel: ConceptualModel;
  private context: ArtefactGeneratorContext;
  private artefact: DataSpecificationArtefact;
  private specification: DataSpecification;
  private partial: (template: string) => string;
  private adapter: HandlebarsAdapter;

  constructor(
    documentationArtifact: DataSpecificationArtefact,
    xmlSchema: XmlSchema,
    conceptualModel: ConceptualModel,
    context: ArtefactGeneratorContext,
    artefact: DataSpecificationArtefact,
    specification: DataSpecification,
    partial: (template: string) => string,
    adapter: HandlebarsAdapter,
  ) {
    this.documentationArtifact = documentationArtifact;
    this.xmlSchema = xmlSchema;
    this.conceptualModel = conceptualModel;
    this.context = context;
    this.artefact = artefact;
    this.specification = specification;
    this.partial = partial;
    this.adapter = adapter;
  }

  private getElementUniqueId(element: XmlSchemaElement | XmlSchemaType | QName | string, type: string | undefined, forceNamespace?: string): string {
    if (!type && typeof element === "object" && !Array.isArray(element)) {
      if (element.entityType === "element") {
        type = "element";
      } else {
        type = "type";
      }
    }
    if (!type) {
      type = "type";
    }

    const fns = forceNamespace ? `${forceNamespace}:` : "";

    if (typeof element === "string") {
      return type + "-" + fns + element;
    } else if (Array.isArray(element)) {
      const ns = element[0] ? `${element[0]}:` : fns;
      return `${type}-${ns}${element[1]}`;
    } else {
      const name = (element as XmlSchemaElement).name ?? (element as XmlSchemaType).name;

      if (typeof name === "string") {
        return type + "-" + fns + name;
      }

      const ns = name[0] ? `${name[0]}:` : fns;
      return `${type}-${ns}${name[1]}`;
    }
  }

  async generateToObject(): Promise<object> {
    const result: Record<string, unknown> = await this.prepareData();

    const prefixToNamespace = {} as Record<string, string>;
    for (const imp of this.xmlSchema.imports) {
      prefixToNamespace[imp.prefix] = imp.namespace + "#";
    }
    prefixToNamespace["xs"] = "https://www.w3.org/TR/xmlschema-2/#";

    result["xml-id-anchor"] = (element: XmlSchemaElement | XmlSchemaType | QName | string, options: any) => {
      const name = (element as XmlSchemaElement).name ?? (element as XmlSchemaType).name ?? element as QName ?? [null, element as string];
      if (name[0] === null && this.xmlSchema.targetNamespacePrefix) {
        return this.getElementUniqueId(element, options.hash.type, this.xmlSchema.targetNamespacePrefix);
      }

      return this.getElementUniqueId(element, options.hash.type);
    };
    result["xml-href"] = (element: XmlSchemaElement | XmlSchemaType | QName | string, options: any) => {
      // Use structure to link to other documentation of structure model
      if (options.hash.structure) {
        const specification = Object.values(this.context.specifications).find(specification => specification.psms.includes(options.hash.structure));
        const artefact = specification.artefacts.find(artefact => artefact.generator === NEW_DOC_GENERATOR);
        const path = pathRelative(this.artefact.publicUrl, artefact.publicUrl, true);
        return path + "#" + this.getElementUniqueId(element, options.hash.type);
      }

      const possibleOutsideReferenceName = (element as XmlSchemaElement).name ?? (element as XmlSchemaType).name ?? element as QName ?? [null, element as string];

      if (possibleOutsideReferenceName[1] === "langString") {
        return "";
      }

      if (possibleOutsideReferenceName[0] !== null && this.xmlSchema.targetNamespacePrefix !== possibleOutsideReferenceName[0]) {
        // This is link to an external element
        return prefixToNamespace[possibleOutsideReferenceName[0]] + possibleOutsideReferenceName[1];
      }
      if (possibleOutsideReferenceName[0] === null && this.xmlSchema.targetNamespacePrefix) {
        return "#" + this.getElementUniqueId(element, options.hash.type, this.xmlSchema.targetNamespacePrefix);
      }
      return "#" + this.getElementUniqueId(element, options.hash.type);
    };

    result["get-semantic-class"] = (annotation: XmlSchemaAnnotation | null, options: any) => {
      if (!annotation?.modelReference) {
        return null;
      }
      let foundObject = null;
      for (const cls of Object.values(this.conceptualModel.classes)) {
        if (annotation.modelReference?.includes(cls.cimIri)) {
          foundObject = cls;
          break;
        }
        for (const prop of cls.properties) {
          if (annotation.modelReference?.includes(prop.cimIri)) {
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
    };

    result["get-examples"] = (annotation: XmlSchemaAnnotation) => {
      return [1,2,34,6, annotation.modelReference];
    };

    result["json"] = (data: unknown) => JSON.stringify(data, null, 2);

    result["useTemplate"] = this.partial(DEFAULT_TEMPLATE);

    return result;
  }

  async prepareData(): Promise<Record<string, any>> {
    const rootElements = [] as (XmlSchemaElement & {
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

    for (const type of this.xmlSchema.types) {
      rootTypes.push({
        ...type,
        linkedChildElements: traverseXmlSchemaType(type, [type]),
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
    }, this.adapter);

    return {
      xmlSchema: this.xmlSchema,
      ...data,
      imports,
      // @ts-ignore
      structureModel: data.structureModels.find(m => m.psmIri === this.artefact.psm),

      rootElements,
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
      <dd>
        <a href="#{{#get-semantic-class annotation}}{{@root/semanticModelLinkId}}{{/get-semantic-class}}">{{translate annotation.metaTitle}}</a>
        {{#if (non-empty annotation.metaDescription)}}({{translate annotation.metaDescription}}){{/if}}
      </dd>
    {{/if}}
  {{/if}}
{{/def}}

{{#def "xml-qname" "name"}}{{#if name.[0]}}{{name.[0]}}:{{/if}}{{name.[1]}}{{/def}}

{{#def "xml-content-type" "type"}}
{{#if (equals type "choice")}} - výběr jednoho elementu z množiny{{/if}}
{{#if (equals type "sequence")}} - elementy v tomto pořadí{{/if}}
{{/def}}

{{#def "xml-schema-complex-content" "contents"}}
  <ul style="margin-top: 0;">
    {{#contents}}
      <li>
        {{#if element}}
          element <a href="{{xml-href element}}"><code>&lt;{{element.name.[1]}}&gt;</code></a> [{{cardinalityMin}}..{{#if cardinalityMax}}{{cardinalityMax}}{{else}}*{{/if}}]
        {{/if}}
        {{#item}}
          {{#if (equals xsType "group")}}
            skupina
            {{#if referencesStructure}}
              referencující
            {{/if}}
            <a href="{{xml-href name type="element" structure=referencesStructure}}"><code>{{xml-qname name}}</code></a> [{{../cardinalityMin}}..{{#if ../cardinalityMax}}{{../cardinalityMax}}{{else}}*{{/if}}]
            {{else}}
            {{#if (or (equals xsType "sequence") (equals xsType "choice") )}}
              {{#if (equals xsType "sequence")}}sekvence{{/if}}{{#if (equals xsType "choice")}}výběr jednoho prvku{{/if}} [{{../cardinalityMin}}..{{#if ../cardinalityMax}}{{../cardinalityMax}}{{else}}*{{/if}}]
              <ul>
                {{xml-schema-complex-content contents}}
              </ul>
              {{else}}
                {{xml-type}} [{{../cardinalityMin}}..{{#if ../cardinalityMax}}{{../cardinalityMax}}{{else}}*{{/if}}]
            {{/if}}
          {{/if}}
        {{/item}}
      </li>
    {{/contents}}
  </ul>
{{/def}}

{{#def "xml-complex-definition" "complexDefinition"}}
  {{#if complexDefinition.contents}}
    <dt>Obsah {{xml-content-type complexDefinition.xsType}}</dt>
    {{xml-schema-complex-content complexDefinition.contents}}
  {{/if}}
{{/def}}

{{#def "xml-type"}}
  <div style="margin-left: 40px;">
    {{#if (and (not simpleDefinition) (not complexDefinition))}}
      <dt>Obsah</dt>
      <dd>
        {{#if (equals name.[1] "langString")}}
          Obsahem elementue je <i>Řetězec s označením jazyka</i>.
        {{else}}
          Obsahem elementu je typ <a href="{{xml-href name}}"><code>{{xml-qname name}}</code></a>.
        {{/if}}
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
    {{/complexDefinition}}

    {{xml-complex-definition complexDefinition}}
  </div>
{{/def}}

<section>
<h3>Přehled XML struktury</h3>
<p>
  Tato sekce popisuje XSD zachycující strukturu pro <i>{{translate structureModel.humanLabel}}</i>, jež je definováno
  v souboru <a href="{{{structureModel.artifact.xml-schema.relativePath}}}"><code>{{structureModel.artifact.xml-schema.relativePath}}</code></a>.
</p>

{{#xmlSchema.targetNamespace}}
  <dl>
    <dt>Definováno v namespace</dt>
    <dd><code>{{.}}</code> (preferovaný prefix: <code>{{@root.xmlSchema.targetNamespacePrefix}}</code>)</dd>
  </dl>
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
      <li> element <a href="{{xml-href .}}"><code>{{xml-qname name}}</code></a></li>
    {{/xmlSchema.elements}}

    {{#xmlSchema.groups}}
      <li> skupina <a href="{{xml-href .}}"><code>{{name}}</code></a></li>
    {{/xmlSchema.groups}}

    {{#xmlSchema.types}}
      <li> {{#if complexDefinition}}komplexní{{/if}}{{#if simpleDefinition}}jednoduchý{{/if}} typ <a href="{{xml-href .}}"><code>{{xml-qname name}}</code></a></li>
    {{/xmlSchema.types}}
  </ul>
</section>



{{#def "xml-non-root-element" "element"}}
<section id="{{xml-id-anchor .}}">
  <h4>Element {{^name.[0]}}{{#path}}{{#if (equals entityType "element")}}<code>&lt;{{name.[1]}}&gt;</code> / {{/if}}{{/path}}{{/name.[0]}}<code>&lt;{{name.[1]}}&gt;</code></h4>

  <dl>
    <dt>Význam</dt>
    <dd>
      {{#each pathFromParentEntity}}
        <i>
          {{#if (equals type "class")}}odkazující na třídu{{/if}}
          {{#if (equals type "property")}}{{#if @first}}vlastnost{{else}}mající vlastnost{{/if}}{{/if}}
          {{#if (equals type "generalization")}}{{#if @first}}z obecnější třídy{{else}}mající obecnější třídu{{/if}}{{/if}}
          {{#if (equals type "specialization")}}{{#if @first}}z konkrétnější třídy{{else}}mající konkrétnější třídu{{/if}}{{/if}}
        </i>

        {{#with entity}}
          <a href="#{{@root/semanticModelLinkId}}"><strong>{{translate humanLabel}}</strong></a>
          {{#if (non-empty humanDescription)}}({{translate humanDescription}}){{/if}}
        {{/with}}

        {{#if (not @last)}}
          <span style="margin: 0 1rem">→</span>
        {{/if}}
      {{/each}}
    </dd>

    {{#effectiveCardinalityFromParentContainer}}
      <dt>Efektivní kardinalita elementu vůči nadřazeném elementu</dt>
      <dd>{{min}}..{{#if max}}{{max}}{{else}}*{{/if}}</dd>
    {{/effectiveCardinalityFromParentContainer}}
    {{#parentEntityInDocumentation}}
      <dt>Nadřazený element</dt>
      <dd><a href="{{xml-href .}}"></a></dd>
    {{/parentEntityInDocumentation}}

    {{#if type}}{{#with type}}
      <dt>Typ elementu</dt>
      {{xml-type}}
    {{/with}}{{else}}
      <i>Element nemá definovaný typ.</i>
    {{/if}}

    {{#if annotation.structureModelEntity.dataTypes.[0].example}}
      <dt>Příklady dat</dt>
      {{#each annotation.structureModelEntity.dataTypes.[0].example}}
        <dd>{{.}}</dd>
      {{/each}}
    {{/if}}
  </dl>
</section>
{{/def}}

{{#rootElements}}
<section id="{{xml-id-anchor .}}">
  <h4>Kořenový element <code>&lt;{{name.[1]}}&gt;</code></h4>
  <dl>
    {{xml-meaning annotation}}

    {{#if type}}{{#with type}}
      <dt>Typ elementu</dt>
      {{xml-type}}
    {{/with}}{{else}}
      <dd><i>Element nemá definovaný typ.</i></dd>
    {{/if}}
  </dl>
</section>
{{#linkedChildElements}}{{xml-non-root-element .}}{{/linkedChildElements}}
{{/rootElements}}

{{#rootGroups}}
<section id="{{xml-id-anchor .}}">
  <h4>Kořenová skupina {{#if name}}<code>{{name}}</code>{{else}}bez pojmenování{{/if}}</h4>
  <dl>
    {{xml-complex-definition definition}}
  </dl>
</section>
{{#linkedChildElements}}{{xml-non-root-element .}}{{/linkedChildElements}}
{{/rootGroups}}

{{#rootTypes}}
<section id="{{xml-id-anchor .}}">
  <h4>Kořenový {{#if complexDefinition}}komplexní{{/if}}{{#if simpleDefinition}}jednoduchý{{/if}} typ {{#if name}}<code>{{xml-qname name}}</code>{{else}}bez pojmenování{{/if}}</h4>
  <dl>
    {{xml-meaning annotation}}

    {{xml-complex-definition complexDefinition}}
  </dl>
</section>
{{#linkedChildElements}}{{xml-non-root-element .}}{{/linkedChildElements}}
{{/rootTypes}}

</section>
`;
