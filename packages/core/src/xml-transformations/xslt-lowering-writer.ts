import * as fileSystem from "fs";
import * as path from "path";
import {OutputStream} from "../io/stream/output-stream";

import {
  XmlTransformation,
  XmlTemplate,
  xmlMatchIsLiteral,
  xmlMatchIsClass,
} from "./xslt-model";

import { XmlWriter, XmlStreamWriter } from "../xml-schema/xml-writer";

import { XSLT_LOWERING } from "./xslt-vocabulary";

const xslNamespace = "http://www.w3.org/1999/XSL/Transform";

export async function saveXsltLoweringToDirectory(
  model: XmlTransformation,
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
  await writeXsltLowering(model, stream);
  
  outputStream.end();

  return result;
}

export async function writeXsltLowering(
  model: XmlTransformation,
  stream: OutputStream
): Promise<void> {
  const writer = new XmlStreamWriter(stream);
  await writeTransformationBegin(model, writer);
  await writeSettings(writer);
  await writeRootTemplates(model, writer);
  await writeCommonTemplates(writer);
  await writeTemplates(model, writer);
  await writeIncludes(model, writer);
  await writeFinalTemplates(writer);
  await writeTransformationEnd(writer);
}

async function writeTransformationBegin(
  model: XmlTransformation,
  writer: XmlWriter
): Promise<void> {
  await writer.writeXmlDeclaration("1.0", "utf-8");
  writer.registerNamespace("xsl", xslNamespace);
  await writer.writeElementBegin("xsl", "stylesheet");
  await writer.writeNamespaceDeclaration("xsl", xslNamespace);
  await writer.writeAndRegisterNamespaceDeclaration(
    "sp", "http://www.w3.org/2005/sparql-results#"
  );
  await writer.writeLocalAttributeValue("version", "1.0");
  
  if (model.targetNamespacePrefix != null) {
    await writer.writeAndRegisterNamespaceDeclaration(
      model.targetNamespacePrefix,
      model.targetNamespace
    );
  }
}

async function writeSettings(
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementBegin("xsl", "output");
  await writer.writeLocalAttributeValue("method", "xml");
  await writer.writeLocalAttributeValue("version", "1.0");
  await writer.writeLocalAttributeValue("encoding", "utf-8");
  await writer.writeLocalAttributeValue("indent", "yes");
  await writer.writeElementEnd("xsl", "output");
  
  await writer.writeElementBegin("xsl", "strip-space");
  await writer.writeLocalAttributeValue("elements", "*");
  await writer.writeElementEnd("xsl", "strip-space");
  
  await writer.writeElementBegin("xsl", "variable");
  await writer.writeLocalAttributeValue("name", "subj");
  await writer.writeLocalAttributeValue("select", "'s'");
  await writer.writeElementEnd("xsl", "variable");
  await writer.writeElementBegin("xsl", "variable");
  await writer.writeLocalAttributeValue("name", "pred");
  await writer.writeLocalAttributeValue("select", "'p'");
  await writer.writeElementEnd("xsl", "variable");
  await writer.writeElementBegin("xsl", "variable");
  await writer.writeLocalAttributeValue("name", "obj");
  await writer.writeLocalAttributeValue("select", "'o'");
  await writer.writeElementEnd("xsl", "variable");
  await writer.writeElementBegin("xsl", "variable");
  await writer.writeLocalAttributeValue("name", "type");
  await writer.writeLocalAttributeValue(
    "select",
    "'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'"
  );
  await writer.writeElementEnd("xsl", "variable");
}

async function writeTransformationEnd(writer: XmlWriter): Promise<void> {
  await writer.writeElementEnd("xsl", "stylesheet");
}

async function writeCommonTemplates(
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementBegin("xsl", "template");
  await writer.writeLocalAttributeValue("match", "sp:literal");
  await writer.writeElementBegin("xsl", "apply-templates");
  await writer.writeLocalAttributeValue("select", "@*");
  await writer.writeElementEnd("xsl", "apply-templates");
  await writer.writeElementBegin("xsl", "value-of");
  await writer.writeLocalAttributeValue("select", ".");
  await writer.writeElementEnd("xsl", "value-of");
  await writer.writeElementEnd("xsl", "template");
  
  await writer.writeElementBegin("xsl", "template");
  await writer.writeLocalAttributeValue("match", "@xml:lang");
  await writer.writeElementBegin("xsl", "copy-of");
  await writer.writeLocalAttributeValue("select", ".");
  await writer.writeElementEnd("xsl", "copy-of");
  await writer.writeElementEnd("xsl", "template");
  
  await writer.writeElementBegin("xsl", "template");
  await writer.writeLocalAttributeValue("match", "sp:uri");
  await writer.writeElementBegin(null, "iri");
  await writer.writeElementBegin("xsl", "value-of");
  await writer.writeLocalAttributeValue("select", ".");
  await writer.writeElementEnd("xsl", "value-of");
  await writer.writeElementEnd(null, "iri");
  await writer.writeElementEnd("xsl", "template");
}

async function writeFinalTemplates(
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementBegin("xsl", "template");
  await writer.writeLocalAttributeValue("match", "@*|*");
  await writer.writeElementEnd("xsl", "template");
}

async function writeRootTemplates(
  model: XmlTransformation,
  writer: XmlWriter
): Promise<void> {
  for (const rootTemplate of model.rootTemplates) {
    await writer.writeElementBegin("xsl", "template");
    const match =
      "//sp:result" +
      "[sp:binding[@name=$pred]/sp:uri/text()=$type and " +
      `sp:binding[@name=$obj]/sp:uri/text()="${rootTemplate.typeIri}"]`;
    await writer.writeLocalAttributeValue("match", match);
    await writer.writeElementBegin(...rootTemplate.elementName);

    await writer.writeElementBegin("xsl", "call-template");
    await writer.writeLocalAttributeValue("name", rootTemplate.targetTemplate);
    await writer.writeElementBegin("xsl", "with-param");
    await writer.writeLocalAttributeValue("name", "id");
    await writer.writeElementBegin("xsl", "copy-of");
    await writer.writeLocalAttributeValue(
      "select",
      "sp:binding[@name=$subj]/*"
    );
    await writer.writeElementEnd("xsl", "copy-of");
    await writer.writeElementEnd("xsl", "with-param");
    await writer.writeElementEnd("xsl", "call-template");

    await writer.writeElementEnd(...rootTemplate.elementName);
    await writer.writeElementEnd("xsl", "template");
  }
}

async function writeTemplates(
  model: XmlTransformation,
  writer: XmlWriter
): Promise<void> {
  for (const template of model.templates) {
    if (template.imported) {
      continue;
    }
    await writer.writeElementBegin("xsl", "template");
    await writer.writeLocalAttributeValue("name", template.name);
    
    await writeTemplateContents(template, writer);
    
    await writer.writeElementEnd("xsl", "template");
  }
}

async function writeTemplateContents(
  template: XmlTemplate,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementBegin("xsl", "param");
  await writer.writeLocalAttributeValue("name", "id");
  await writer.writeElementEnd("xsl", "param");

  await writer.writeElementBegin("xsl", "apply-templates");
  await writer.writeLocalAttributeValue("select", "$id/*");
  await writer.writeElementEnd("xsl", "apply-templates");
  
  await writer.writeElementBegin("xsl", "variable");
  await writer.writeLocalAttributeValue("name", "id_test");
  await writer.writeElementBegin("xsl", "value-of");
  await writer.writeLocalAttributeValue(
    "select",
    "concat(namespace-uri($id), ' ', local-name($id), ' ', string($id))"
  );
  await writer.writeElementEnd("xsl", "value-of");
  await writer.writeElementEnd("xsl", "variable");

  for (const match of template.propertyMatches) {
    await writer.writeElementBegin("xsl", "for-each");
    const path =
      "//sp:result" +
      "[sp:binding[@name=$subj]/*[$id_test = " +
      "concat(namespace-uri(), ' ', local-name(), ' ', string())] and " +
      `sp:binding[@name=$pred]/sp:uri/text()="${match.propertyIri}"]`;
    await writer.writeLocalAttributeValue("select", path);
    await writer.writeElementBegin(...match.propertyName);

    if (xmlMatchIsLiteral(match)) {
      await writer.writeElementBegin("xsl", "apply-templates");
      await writer.writeLocalAttributeValue(
        "select",
        "sp:binding[@name=$obj]"
      );
      await writer.writeElementEnd("xsl", "apply-templates");
    } else if (xmlMatchIsClass(match)) {
      // TODO dematerialized
      await writer.writeElementBegin("xsl", "call-template");
      await writer.writeLocalAttributeValue("name", match.targetTemplate);
      await writer.writeElementBegin("xsl", "with-param");
      await writer.writeLocalAttributeValue("name", "id");
      await writer.writeElementBegin("xsl", "copy-of");
      await writer.writeLocalAttributeValue(
        "select",
        "sp:binding[@name=$obj]/*"
      );
      await writer.writeElementEnd("xsl", "copy-of");
      await writer.writeElementEnd("xsl", "with-param");
      await writer.writeElementEnd("xsl", "call-template");
    }

    await writer.writeElementEnd(...match.propertyName);
    await writer.writeElementEnd("xsl", "for-each");
  }
}

async function writeIncludes(
  model: XmlTransformation,
  writer: XmlWriter
): Promise<void> {
  for (const include of model.includes) {
    const location = include.locations[XSLT_LOWERING.Generator];
    await writer.writeElementValue("xsl", "include", location);
  }
}
