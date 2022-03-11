import * as fileSystem from "fs";
import * as path from "path";
import {OutputStream} from "../io/stream/output-stream";

import {
  XmlTemplate,
  XmlTransformation,
  xmlMatchIsLiteral,
  xmlMatchIsClass,
} from "./xslt-model";

import { XmlWriter, XmlStreamWriter } from "../xml-schema/xml-writer";

import { XSLT_LIFTING } from "./xslt-vocabulary";

const xslNamespace = "http://www.w3.org/1999/XSL/Transform";

export async function saveXsltLiftingToDirectory(
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
  await writeXsltLifting(model, stream);
  
  outputStream.end();

  return result;
}

export async function writeXsltLifting(
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
    "rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  );
  await writer.writeLocalAttributeValue("version", "1.0");
  
  if (model.targetNamespacePrefix != null) {
    await writer.writeAndRegisterNamespaceDeclaration(
      model.targetNamespacePrefix,
      model.targetNamespace
    );
  }

  for (const prefix of Object.keys(model.rdfNamespaces)) {
    await writer.writeAndRegisterNamespaceDeclaration(
      prefix,
      model.rdfNamespaces[prefix]
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
  await writer.writeLocalAttributeValue("media-type", "application/rdf+xml");
  await writer.writeLocalAttributeValue("indent", "yes");
  await writer.writeElementEnd("xsl", "output");
  
  await writer.writeElementBegin("xsl", "strip-space");
  await writer.writeLocalAttributeValue("elements", "*");
  await writer.writeElementEnd("xsl", "strip-space");
}

async function writeTransformationEnd(writer: XmlWriter): Promise<void> {
  await writer.writeElementEnd("xsl", "stylesheet");
}

async function writeCommonTemplates(
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementBegin("xsl", "template");
  await writer.writeLocalAttributeValue("match", "iri");
  await writer.writeElementBegin("xsl", "attribute");
  await writer.writeLocalAttributeValue("name", "rdf:about");
  await writer.writeElementBegin("xsl", "value-of");
  await writer.writeLocalAttributeValue("select", ".");
  await writer.writeElementEnd("xsl", "value-of");
  await writer.writeElementEnd("xsl", "attribute");
  await writer.writeElementEnd("xsl", "template");
  
  await writer.writeElementBegin("xsl", "template");
  await writer.writeLocalAttributeValue("match", "@xml:lang");
  await writer.writeElementBegin("xsl", "copy-of");
  await writer.writeLocalAttributeValue("select", ".");
  await writer.writeElementEnd("xsl", "copy-of");
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
    const match = "/" + writer.getQName(...rootTemplate.elementName);
    await writer.writeLocalAttributeValue("match", match);
    await writer.writeElementBegin("rdf", "RDF");

    await writer.writeElementBegin("xsl", "call-template");
    await writer.writeLocalAttributeValue("name", rootTemplate.targetTemplate);
    await writer.writeElementEnd("xsl", "call-template");

    await writer.writeElementEnd("rdf", "RDF");
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
  await writer.writeElementBegin("rdf", "Description");

  await writer.writeElementBegin("xsl", "apply-templates");
  await writer.writeElementEnd("xsl", "apply-templates");

  for (const match of template.propertyMatches) {
    await writer.writeElementBegin("xsl", "for-each");
    const name = writer.getQName(...match.propertyName);
    await writer.writeLocalAttributeValue("select", name);
    await writer.writeElementBegin(...match.interpretation);

    if (xmlMatchIsLiteral(match)) {
      await writer.writeAttributeValue("rdf", "datatype", match.dataTypeIri);
      
      await writer.writeElementBegin("xsl", "value-of");
      await writer.writeLocalAttributeValue("select", ".");
      await writer.writeElementEnd("xsl", "value-of");
    } else if (xmlMatchIsClass(match)) {
      // TODO dematerialized
      await writer.writeElementBegin("xsl", "apply-templates");
      await writer.writeElementEnd("xsl", "apply-templates");
  
      await writer.writeElementBegin("xsl", "call-template");
      await writer.writeLocalAttributeValue("name", match.targetTemplate);
      await writer.writeElementEnd("xsl", "call-template");
    }

    await writer.writeElementEnd(...match.interpretation);
    await writer.writeElementEnd("xsl", "for-each");
  }
  
  await writer.writeElementEnd("rdf", "Description");
}

async function writeIncludes(
  model: XmlTransformation,
  writer: XmlWriter
): Promise<void> {
  for (const include of model.includes) {
    const location = include.locations[XSLT_LIFTING.Generator];
    await writer.writeElementValue("xsl", "include", location);
  }
}
