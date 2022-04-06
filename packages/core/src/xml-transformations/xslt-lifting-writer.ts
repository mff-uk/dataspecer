import {OutputStream} from "../io/stream/output-stream";

import {
  XmlTemplate,
  XmlTransformation,
  xmlMatchIsLiteral,
  xmlMatchIsClass,
  XmlMatch,
} from "./xslt-model";

import { XmlWriter, XmlStreamWriter } from "../xml/xml-writer";

import { XSLT_LIFTING } from "./xslt-vocabulary";

const xslNamespace = "http://www.w3.org/1999/XSL/Transform";

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
  await writer.writeLocalAttributeValue("version", "2.0");
  
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
  await writer.writeElementFull("xsl", "output")(async writer => {
    await writer.writeLocalAttributeValue("method", "xml");
    await writer.writeLocalAttributeValue("version", "1.0");
    await writer.writeLocalAttributeValue("encoding", "utf-8");
    await writer.writeLocalAttributeValue("media-type", "application/rdf+xml");
    await writer.writeLocalAttributeValue("indent", "yes");
  });
  
  await writer.writeElementFull("xsl", "strip-space")(async writer => {
    await writer.writeLocalAttributeValue("elements", "*");
  });
}

async function writeTransformationEnd(writer: XmlWriter): Promise<void> {
  await writer.writeElementEnd("xsl", "stylesheet");
}

async function writeCommonTemplates(
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "template")(async writer => {
    await writer.writeLocalAttributeValue("match", "iri");
    await writer.writeElementFull("xsl", "attribute")(async writer => {
      await writer.writeLocalAttributeValue("name", "rdf:about");
      await writer.writeElementFull("xsl", "value-of")(async writer => {
        await writer.writeLocalAttributeValue("select", ".");
      });
    });
  })
  
  await writer.writeElementFull("xsl", "template")(async writer => {
    await writer.writeLocalAttributeValue("match", "@xml:lang");
    await writer.writeElementFull("xsl", "copy-of")(async writer => {
      await writer.writeLocalAttributeValue("select", ".");
    });
  });
}

async function writeFinalTemplates(
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "template")(async writer => {
    await writer.writeLocalAttributeValue("match", "@*|*");
  });
}

async function writeRootTemplates(
  model: XmlTransformation,
  writer: XmlWriter
): Promise<void> {
  for (const rootTemplate of model.rootTemplates) {
    await writer.writeElementFull("xsl", "template")(async writer => {
      const match = "/" + writer.getQName(...rootTemplate.elementName);
      await writer.writeLocalAttributeValue("match", match);

      await writer.writeElementFull("rdf", "RDF")(async writer => {
        await writer.writeElementFull("xsl", "call-template")(async writer => {
          await writer.writeLocalAttributeValue(
            "name", rootTemplate.targetTemplate
          );
        });
      });
    })
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
    await writer.writeElementFull("xsl", "template")(async writer => {
      await writer.writeLocalAttributeValue("name", template.name);
      
      await writeTemplateContents(template, writer);
    });
  }
}

async function writeTemplateContents(
  template: XmlTemplate,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("rdf", "Description")(async writer => {
    await writer.writeElementFull("xsl", "apply-templates")(async writer => {
      await writer.writeLocalAttributeValue("select", "@*|*");
    });
  
    if (template.classIri != null) {
      await writer.writeElementFull("rdf", "type")(async writer => {
        await writer.writeAttributeValue("rdf", "resource", template.classIri);
      });
    }
  
    for (const match of template.propertyMatches) {
      await writeTemplateMatch(match, writer);
    }
  });
}

async function writeTemplateMatch(
  match: XmlMatch,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "for-each")(async writer => {
    const name = writer.getQName(...match.propertyName);
    await writer.writeLocalAttributeValue("select", name);
    await writer.writeElementFull(...match.interpretation)(async writer => {
      if (xmlMatchIsLiteral(match)) {
        await writer.writeAttributeValue(
          "rdf", "datatype", match.dataTypeIri
        );
      
        await writer.writeElementFull("xsl", "apply-templates")(async writer => {
          await writer.writeLocalAttributeValue("select", "@*");
        });
        
        await writer.writeElementFull("xsl", "value-of")(async writer => {
          await writer.writeLocalAttributeValue("select", ".");
        });
      } else if (xmlMatchIsClass(match)) {
        // TODO dematerialized
        await writer.writeElementFull("xsl", "call-template")(async writer => {
          await writer.writeLocalAttributeValue("name", match.targetTemplate);
        });
      }
    });
  });
}

async function writeIncludes(
  model: XmlTransformation,
  writer: XmlWriter
): Promise<void> {
  for (const include of model.includes) {
    const location = include.locations[XSLT_LIFTING.Generator];
    if (location != null) {
      await writer.writeElementFull("xsl", "include")(async writer => {
        await writer.writeLocalAttributeValue("href", location);
      });
    }
  }
}
