import * as fileSystem from "fs";
import * as path from "path";
import {OutputStream} from "../io/stream/output-stream";

import {
  XmlSchema,
  XmlSchemaComplexContent,
  XmlSchemaComplexTypeDefinition,
  XmlSchemaElement,
  XmlSchemaSimpleTypeDefinition,
  xmlSchemaTypeIsComplex,
  xmlSchemaTypeIsSimple,
  xmlSchemaComplexContentIsElement,
  xmlSchemaComplexContentIsType,
  langStringName,
  xmlSchemaComplexTypeDefinitionIsGroupReference,
  XmlSchemaGroupDefinition,
  XmlSchemaAnnotation,
} from "./xml-schema-model";

import { XmlWriter, XmlStreamWriter } from "./xml-writer";

const xsNamespace = "http://www.w3.org/2001/XMLSchema";

export async function saveXmlSchemaToDirectory(
  model: XmlSchema,
  directory: string,
  name: string
): Promise<void> {
  if (!fileSystem.existsSync(directory)) {
    fileSystem.mkdirSync(directory);
  }

  const outputStream = fileSystem.createWriteStream(
    path.join(directory, name + ".xsd")
  );

  const result = new Promise<void>((accept, reject) => {
    outputStream.on("close", accept);
    outputStream.on("error", reject);
  });

  const stream = {
    write: async (chunk) => {
      outputStream.write(chunk);
    },
  } as OutputStream;
  await writeXmlSchema(model, stream);
  
  outputStream.end();

  return result;
}

export async function writeXmlSchema(
  model: XmlSchema,
  stream: OutputStream
): Promise<void> {
  const writer = new XmlStreamWriter(stream);
  await writeSchemaBegin(model, writer);
  await writeImportsAndDefinitions(model, writer);
  await writeGroups(model, writer);
  await writeElements(model, writer);
  await writeSchemaEnd(writer);
}

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
  
  for (const importDeclaration of model.imports) {
    if (
      importDeclaration.namespace != null &&
      importDeclaration.prefix != null
    ) {
      await writer.writeAndRegisterNamespaceDeclaration(
        importDeclaration.prefix,
        importDeclaration.namespace
      );
    }
  }
}

async function writeSchemaEnd(writer: XmlWriter): Promise<void> {
  await writer.writeElementEnd("xs", "schema");
}

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
  for (const importDeclaration of model.imports) {
    if (importDeclaration.namespace != null) {
      await writer.writeElementBegin("xs", "import");
    } else {
      await writer.writeElementBegin("xs", "include");
      await writer.writeLocalAttributeValue(
        "namespace",
        importDeclaration.namespace
      );
    }
    await writer.writeLocalAttributeValue(
      "schemaLocation",
      importDeclaration.schemaLocation
    );
    if (importDeclaration.namespace != null) {
      await writer.writeElementEnd("xs", "import");
    } else {
      await writer.writeElementEnd("xs", "include");
    }
  }
}

async function writeGroups(model: XmlSchema, writer: XmlWriter): Promise<void> {
  for (const group of model.groups) {
    await writeGroup(group, writer);
  }
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
    for (const content of group.contents) {
      if (xmlSchemaComplexContentIsElement(content)) {
        await writeElement(content.element, content, writer);
      }
      if (xmlSchemaComplexContentIsType(content)) {
        await writeComplexContent(content.complexType, content, false, writer);
      }
    }
  });
}

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
  annotation: XmlSchemaAnnotation | null,
  writer: XmlWriter
): Promise<void> {
  if (annotation != null) {
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
    if (element.source != null) {
      await writer.writeLocalAttributeValue(
        "ref",
        writer.getQName(element.source.prefix, element.elementName)
      );
    } else {
      await writer.writeLocalAttributeValue("name", element.elementName);
      const type = element.type;
      if (type.name != null) {
        await writer.writeLocalAttributeValue(
          "type",
          writer.getQName(type.source?.prefix, type.name)
        );
        await writeAnnotation(element.annotation, writer);
      } else {
        if (xmlSchemaTypeIsComplex(type)) {
          await writeAnnotation(element.annotation, writer);
          await writeComplexType(type.complexDefinition, type.annotation, writer);
        } else if (xmlSchemaTypeIsSimple(type)) {
          await writeSimpleType(
            type.simpleDefinition, true, element.annotation, writer
          );
        }
      }
    }
  });
}

/**
 * Writes out an xs:complexType from its definition.
 */
async function writeComplexType(
  definition: XmlSchemaComplexTypeDefinition,
  annotation: XmlSchemaAnnotation,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xs", "complexType")(async writer => {
    if (definition.mixed) {
      await writer.writeLocalAttributeValue("mixed", "true");
    }
    await writeAnnotation(annotation, writer);
    if (definition.xsType != null) {
      await writeComplexContent(definition, null, false, writer);
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
  const cardinality = content.cardinality;
  if (cardinality != null) {
    if (cardinality.min !== 1) {
      await writer.writeLocalAttributeValue(
        "minOccurs",
        cardinality.min.toString()
      );
    }
    if (cardinality.max !== 1) {
      await writer.writeLocalAttributeValue(
        "maxOccurs",
        cardinality.max?.toString() ?? "unbounded"
      );
    }
  }
}

/**
 * Tests if an element in an xs:complexType has attributes.
 */
function complexContentHasAttributes(
  content: XmlSchemaComplexContent | null,
): boolean {
  if (content == null) {
    return false;
  }
  const cardinality = content.cardinality;
  if (cardinality != null) {
    if (cardinality.min !== 1) {
      return true;
    }
    if (cardinality.max !== 1) {
      return true;
    }
  }
  return false;
}

/**
 * Writes out an aggregate element inside an xs:complexType.
 */
async function writeComplexContent(
  definition: XmlSchemaComplexTypeDefinition,
  parentContent: XmlSchemaComplexContent | null,
  inSequence: boolean,
  writer: XmlWriter,
): Promise<void> {
  if (
    inSequence &&
    definition.xsType == "sequence" &&
    !complexContentHasAttributes(parentContent)
  ) {
    await writeComplexTypes(definition, writer);
  } else {
    await writer.writeElementFull("xs", definition.xsType)(async writer => {
      await writeAttributesForComplexContent(parentContent, writer);
      if (xmlSchemaComplexTypeDefinitionIsGroupReference(definition)) {
        await writer.writeLocalAttributeValue(
          "ref",
          writer.getQName(definition.source?.prefix, definition.name)
        );
      } else {
        await writeComplexTypes(definition, writer);
      }
    });
  }
}

/**
 * Writes out individual members of an xs:complexType element.
 */
async function writeComplexTypes(
  definition: XmlSchemaComplexTypeDefinition,
  writer: XmlWriter
): Promise<void> {
  const inSequence = definition.xsType == "sequence";
  for (const content of definition.contents) {
    if (xmlSchemaComplexContentIsElement(content)) {
      await writeElement(content.element, content, writer);
    }
    if (xmlSchemaComplexContentIsType(content)) {
      await writeComplexContent(content.complexType, content, inSequence, writer);
    }
  }
}

/**
 * Writes out an xs:simpleType from its definition.
 */
async function writeSimpleType(
  definition: XmlSchemaSimpleTypeDefinition,
  allowCollapse: boolean,
  annotation: XmlSchemaAnnotation | null,
  writer: XmlWriter
): Promise<void> {
  const contents = definition.contents;
  if (allowCollapse && contents.length === 1) {
    await writer.writeLocalAttributeValue(
      "type",
      writer.getQName(...contents[0])
    );
    await writeAnnotation(annotation, writer);
  } else {
    await writeAnnotation(annotation, writer);
    await writer.writeElementFull("xs", "simpleType")(async writer => {
      if (definition.xsType != null) {
        await writer.writeElementFull("xs", definition.xsType)(async writer => {
          await writer.writeLocalAttributeValue(
            "memberTypes",
            contents.map((name) => writer.getQName(...name)).join(" ")
          );
        });
      }
    });
  }
}
