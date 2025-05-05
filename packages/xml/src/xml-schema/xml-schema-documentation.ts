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
} from "./xml-schema-model.ts";
import { ArtefactGeneratorContext } from "@dataspecer/core/generator/artefact-generator-context";
import { pathRelative } from "@dataspecer/core/core/utilities/path-relative";
import { QName } from "../conventions.ts";
import { NEW_DOC_GENERATOR } from "./xml-schema-generator.ts";
import { getMustacheView } from "@dataspecer/documentation";
import { HandlebarsAdapter } from "../../../handlebars-adapter/lib/interface.js";
import { MAIN_XML_PARTIAL } from "../documentation/index.ts";

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
    for (const {prefix, namespace} of this.xmlSchema.namespaces) {
      prefixToNamespace[prefix] = namespace;
    }

    result["xml-id-anchor"] = (element: XmlSchemaElement | XmlSchemaType | QName | string, options: any) => {
      const name = (element as XmlSchemaElement).name ?? (element as XmlSchemaType).name ?? element as QName ?? [null, element as string];
      if (name[0] === null && this.xmlSchema.targetNamespacePrefix) {
        return this.getElementUniqueId(element, options.hash.type, this.xmlSchema.targetNamespacePrefix);
      }

      return this.getElementUniqueId(element, options.hash.type);
    };
    result["xml-href"] = (element: XmlSchemaElement | XmlSchemaType | QName | string, options: any) => {
      if (!element) {
        return "";
      }
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

    result["useTemplate"] = this.partial(`{{#> ${MAIN_XML_PARTIAL}}}{{/${MAIN_XML_PARTIAL}}}`);

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
        prefix: this.xmlSchema.namespaces[imp.namespace],
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
