import {OutputStream} from "@dataspecer/core/io/stream/output-stream";

import {
  XmlSchema,
  XmlSchemaComplexContent,
  XmlSchemaComplexItem,
  XmlSchemaElement,
  xmlSchemaTypeIsComplex,
  xmlSchemaTypeIsSimple,
  xmlSchemaComplexContentIsElement,
  xmlSchemaComplexContentIsItem,
  xmlSchemaComplexTypeDefinitionIsGroup,
  XmlSchemaGroupDefinition,
  XmlSchemaSimpleType,
  XmlSchemaComplexType,
  xmlSchemaComplexTypeDefinitionIsSequence,
  xmlSchemaComplexTypeDefinitionIsChoice,
  xmlSchemaComplexTypeDefinitionIsAll,
  XmlSchemaComplexContainer,
  XmlSchemaAnnotated,
  XmlSchemaType,
  xmlSchemaComplexTypeDefinitionIsExtension,
} from "./xml-schema-model";

import { XmlWriter, XmlStreamWriter } from "../xml/xml-writer";
import { commonXmlNamespace, commonXmlPrefix, commonXmlSchema, langStringName } from "../conventions";

const xsNamespace = "http://www.w3.org/2001/XMLSchema";

/**
 * Writes the full XML Schema to output. 
 */
export async function writeXmlSchema(
  model: XmlSchema,
  stream: OutputStream
): Promise<void> {
  const writer = new XmlStreamWriter(stream);
  await writeSchemaBegin(model, writer);
  await writeImportsAndDefinitions(model, writer);
  await writeTypes(model, writer);
  await writeGroups(model, writer);
  await writeElements(model, writer);
  await writeSchemaEnd(writer);
}

/**
 * Writes the beginning of the schema, including the XML declaration,
 * schema definition and options, and declares used namespaces. 
 */
async function writeSchemaBegin(
  model: XmlSchema,
  writer: XmlWriter
): Promise<void> {
  await writer.writeXmlDeclaration("1.0", "utf-8");
  writer.registerNamespace("xs", xsNamespace);
  await writer.writeElementBegin("xs", "schema");
  await writer.writeNamespaceDeclaration("xs", xsNamespace);
  await writer.writeLocalAttributeValue("version", "1.1");
  if (model.targetNamespace != null) {
    await writer.writeLocalAttributeValue("elementFormDefault", "qualified");
    await writer.writeLocalAttributeValue(
      "targetNamespace",
      model.targetNamespace
    );
    if (model.targetNamespacePrefix != null) {
      await writer.writeAndRegisterNamespaceDeclaration(
        model.targetNamespacePrefix,
        model.targetNamespace
      );
    }
  } else {
    await writer.writeLocalAttributeValue("elementFormDefault", "unqualified");
  }
  
  if (commonXmlNamespace != null) {
    await writer.writeAndRegisterNamespaceDeclaration(
      commonXmlPrefix,
      commonXmlNamespace
    );
  }

  const registered: Record<string, string> = {};
  
  for (const importDeclaration of model.imports) {
    const namespace = await importDeclaration.namespace;
    const prefix = await importDeclaration.prefix;
    if (
      namespace != null &&
      prefix != null
    ) {
      if (registered[prefix] == null) {
        await writer.writeAndRegisterNamespaceDeclaration(
          prefix,
          namespace
        );
        registered[prefix] = namespace;
      } else if (registered[prefix] !== namespace) {
        throw new Error(
          `Imported namespace prefix "${prefix}:" is used for two ` + 
          `different namespaces, "${registered[prefix]}" and "${namespace}".`
        );
      }
    }
  }
  
  await writer.writeAndRegisterNamespaceDeclaration(
    "sawsdl",
    "http://www.w3.org/ns/sawsdl"
  );
}

/**
 * Writes the end tag of the schema.
 */
async function writeSchemaEnd(writer: XmlWriter): Promise<void> {
  await writer.writeElementEnd("xs", "schema");
}

/**
 * Writes import/include declarations of external schemas, and defines
 * langString if necessary.
 */
async function writeImportsAndDefinitions(
  model: XmlSchema,
  writer: XmlWriter
): Promise<void> {
  if (model.defineLangString) {
    await writer.writeElementFull("xs", "import")(async writer => {
      await writer.writeLocalAttributeValue(
        "namespace",
        writer.getUriForPrefix("xml")
      );
      await writer.writeLocalAttributeValue(
        "schemaLocation",
        "http://www.w3.org/2001/xml.xsd"
      );
    });
  }
  
  if (commonXmlNamespace != null) {
    await writer.writeElementFull("xs", "import")(async writer => {
      await writer.writeLocalAttributeValue(
        "namespace",
        commonXmlNamespace
      );
      await writer.writeLocalAttributeValue(
        "schemaLocation",
        commonXmlSchema
      );
    });
  }

  for (const importDeclaration of model.imports) {
    const namespace = await importDeclaration.namespace;
    await writer.writeElementFull("xs", "import")(async writer => {
      await writer.writeLocalAttributeValue(
        "namespace",
        namespace
      );
      await writer.writeLocalAttributeValue(
        "schemaLocation",
        importDeclaration.schemaLocation
      );
    });
  }
  
  if (model.defineLangString) {
    await writer.writeElementFull("xs", "complexType")(async writer => {
      await writer.writeLocalAttributeValue(
        "name",
        writer.getQName(...langStringName)
      );
      await writer.writeElementFull("xs", "simpleContent")(async writer => {
        await writer.writeElementFull("xs", "extension")(async writer => {
          await writer.writeLocalAttributeValue(
            "base",
            writer.getQName("xs", "string")
          );
          await writer.writeElementFull("xs", "attribute")(async writer => {
            await writer.writeLocalAttributeValue(
              "ref",
              writer.getQName("xml", "lang")
            );
            await writer.writeLocalAttributeValue("use", "required");
          });
        });
      });
    });
  }
}

/**
 * Writes the list of types in the schema. 
 */
async function writeTypes(model: XmlSchema, writer: XmlWriter): Promise<void> {
  for (const type of model.types) {
    if (xmlSchemaTypeIsComplex(type)) {
      await writeComplexType(type, writer);
    } else if (xmlSchemaTypeIsSimple(type)) {
      await writeSimpleType(type, writer);
    } else {
      await writeUnrecognizedObject(type, writer);
    }
  }
}

/**
 * Writes the list of groups in the schema. 
 */
async function writeGroups(model: XmlSchema, writer: XmlWriter): Promise<void> {
  for (const group of model.groups) {
    await writeGroup(group, writer);
  }
}

/**
 * Debug function - writes out an object that was not recognized from model.
 */
async function writeUnrecognizedObject(
  object: any,
  writer: XmlWriter
) {
  await writer.writeComment(
    "The following object was not recognized:\n" + JSON.stringify(object)
  );
}

/**
 * Writes out an xs:group definition.
 */
async function writeGroup(
  group: XmlSchemaGroupDefinition,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xs", "group")(async writer => {
    await writer.writeLocalAttributeValue("name", group.name);
    await writeComplexContent(group.definition, null, writer);
  });
}

/**
 * Writes out the list of elements in the schema. 
 */
async function writeElements(
  model: XmlSchema,
  writer: XmlWriter
): Promise<void> {
  for (const element of model.elements) {
    await writeElement(element, null, writer);
  }
}

/**
 * Writes out an xs:annotation.
 */
async function writeAnnotation(
  annotated: XmlSchemaAnnotated,
  writer: XmlWriter
): Promise<void> {
  const annotation = annotated?.annotation;
  if (annotation != null) {
    await writer.writeAttributeValue(
      "sawsdl", "modelReference", annotation.modelReference
    );
    await writer.writeElementFull("xs", "annotation")(async writer => {
      await writer.writeElementValue(
        "xs", "documentation", annotation.documentation
      );
    });
  }
}

/**
 * Writes out an xs:element definition.
 */
async function writeElement(
  element: XmlSchemaElement,
  parentContent: XmlSchemaComplexContent | null,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xs", "element")(async writer => {
    await writeAttributesForComplexContent(parentContent, writer);
    const name = await element.elementName;
    if (element.type == null) {
      // An element with no type uses ref to its name.
      await writer.writeLocalAttributeValue(
        "ref",
        writer.getQName(...name)
      );
      await writeAnnotation(element, writer);
    } else {
      await writer.writeLocalAttributeValue("name", name[1]);
      const type = element.type;
      if (type.name != null) {
        // The type is specified in the schema, simply use its name.
        await writer.writeLocalAttributeValue(
          "type",
          writer.getQName(...type.name)
        );
        await writeAnnotation(element, writer);
      } else {
        // The type is defined inline.
        await writeAnnotation(element, writer);
        if (xmlSchemaTypeIsComplex(type)) {
          await writeComplexType(type, writer);
        } else if (xmlSchemaTypeIsSimple(type)) {
          await writeSimpleType(type, writer);
        } else {
          await writeUnrecognizedObject(type, writer);
        }
      }
    }
  });
}

/**
 * Writes attributes and elements for an xs:complexType or an xs:simpleType.
 */
async function writeTypeAttributes(
  type: XmlSchemaType,
  writer: XmlWriter
): Promise<void> {
  if (type.name != null) {
    await writer.writeLocalAttributeValue(
      "name", writer.getQName(...type.name)
    );
  }
  await writeAnnotation(type, writer);
}

/**
 * Writes out an xs:complexType.
 */
async function writeComplexType(
  type: XmlSchemaComplexType,
  writer: XmlWriter
): Promise<void> {
  const definition = type.complexDefinition;
  await writer.writeElementFull("xs", "complexType")(async writer => {
    if (type.mixed) {
      await writer.writeLocalAttributeValue("mixed", "true");
    }
    if (type.abstract) {
      await writer.writeLocalAttributeValue("abstract", "true");
    }
    await writeTypeAttributes(type, writer);
    if (xmlSchemaComplexTypeDefinitionIsExtension(definition)) {
      await writer.writeElementFull("xs", "complexContent")(async writer => {
        await writeComplexContent(definition, null, writer);
      });
    } else {
      await writeComplexContent(definition, null, writer);
    }
  });
}

/**
 * Writes out attributes shared by elements in an xs:complexType.
 */
async function writeAttributesForComplexContent(
  content: XmlSchemaComplexContent | null,
  writer: XmlWriter
): Promise<void> {
  if (content == null) {
    return;
  }
  const cardinalityMin = content.cardinalityMin;
  const cardinalityMax = content.cardinalityMax;
  if (cardinalityMin !== 1) {
    await writer.writeLocalAttributeValue(
      "minOccurs",
      cardinalityMin.toString()
    );
  }
  if (cardinalityMax !== 1) {
    await writer.writeLocalAttributeValue(
      "maxOccurs",
      cardinalityMax?.toString() ?? "unbounded"
    );
  }
}

/**
 * Writes out an aggregate element inside an xs:complexType.
 */
async function writeComplexContent(
  definition: XmlSchemaComplexItem,
  parentContent: XmlSchemaComplexContent | null,
  writer: XmlWriter,
): Promise<void> {
  await writer.writeElementFull("xs", definition.xsType)(async writer => {
    await writeAttributesForComplexContent(parentContent, writer);
    if (xmlSchemaComplexTypeDefinitionIsGroup(definition)) {
      await writer.writeLocalAttributeValue(
        "ref", writer.getQName(...await definition.name)
      );
    } else if (
      xmlSchemaComplexTypeDefinitionIsSequence(definition) ||
      xmlSchemaComplexTypeDefinitionIsChoice(definition) ||
      xmlSchemaComplexTypeDefinitionIsAll(definition)
    ) {
      await writeComplexContainer(definition, writer);
    } else if (xmlSchemaComplexTypeDefinitionIsExtension(definition)) {
      await writer.writeLocalAttributeValue(
        "base", writer.getQName(...definition.base)
      );
      await writeComplexContainer(definition, writer);
    } else {
      await writeUnrecognizedObject(definition, writer);
    }
  });
}

/**
 * Writes out individual members of an xs:complexType element.
 */
async function writeComplexContainer(
  definition: XmlSchemaComplexContainer,
  writer: XmlWriter
): Promise<void> {
  for (const content of definition.contents) {
    if (xmlSchemaComplexContentIsElement(content)) {
      await writeElement(content.element, content, writer);
    }
    if (xmlSchemaComplexContentIsItem(content)) {
      await writeComplexContent(content.item, content, writer);
    }
  }
}

/**
 * Writes out an xs:simpleType.
 */
async function writeSimpleType(
  type: XmlSchemaSimpleType,
  writer: XmlWriter
): Promise<void> {
  const definition = type.simpleDefinition;
  const contents = definition.contents;
  await writer.writeElementFull("xs", "simpleType")(async writer => {
    await writeTypeAttributes(type, writer);
    if (definition.xsType != null) {
      await writer.writeElementFull("xs", definition.xsType)(async writer => {
        // In case of xs:union and similar.
        await writer.writeLocalAttributeValue(
          "memberTypes",
          contents.map(name => writer.getQName(...name)).join(" ")
        );
      });
    }
  });
}
