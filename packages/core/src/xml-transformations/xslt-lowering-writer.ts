import {OutputStream} from "../io/stream/output-stream";

import {
  XmlTransformation,
  XmlTemplate,
  xmlMatchIsLiteral,
  xmlMatchIsClass,
  XmlRootTemplate,
  XmlMatch,
  xmlMatchIsCodelist,
} from "./xslt-model";

import { XmlWriter, XmlStreamWriter } from "../xml/xml-writer";

import { XSLT_LOWERING } from "./xslt-vocabulary";

const xslNamespace = "http://www.w3.org/1999/XSL/Transform";

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
  await writer.writeAndRegisterNamespaceDeclaration(
    "xsi", "http://www.w3.org/2001/XMLSchema-instance"
  );
  await writer.writeLocalAttributeValue("version", "2.0");
  
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
  await writer.writeElementFull("xsl", "output")(async writer => {
    await writer.writeLocalAttributeValue("method", "xml");
    await writer.writeLocalAttributeValue("version", "1.0");
    await writer.writeLocalAttributeValue("encoding", "utf-8");
    await writer.writeLocalAttributeValue("indent", "yes");
  })
  
  await writer.writeElementFull("xsl", "strip-space")(async writer => {
    await writer.writeLocalAttributeValue("elements", "*");
  });
  
  await writer.writeElementFull("xsl", "variable")(async writer => {
    await writer.writeLocalAttributeValue("name", "subj");
    await writer.writeLocalAttributeValue("select", "'s'");
  });
  
  await writer.writeElementFull("xsl", "variable")(async writer => {
    await writer.writeLocalAttributeValue("name", "pred");
    await writer.writeLocalAttributeValue("select", "'p'");
  });
  
  await writer.writeElementFull("xsl", "variable")(async writer => {
    await writer.writeLocalAttributeValue("name", "obj");
    await writer.writeLocalAttributeValue("select", "'o'");
  });
  
  await writer.writeElementFull("xsl", "variable")(async writer => {
    await writer.writeLocalAttributeValue("name", "type");
    await writer.writeLocalAttributeValue(
      "select",
      "'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'"
    );
  });
}

async function writeTransformationEnd(writer: XmlWriter): Promise<void> {
  await writer.writeElementEnd("xsl", "stylesheet");
}

async function writeCommonTemplates(
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "template")(async writer => {
    await writer.writeLocalAttributeValue("match", "sp:literal");
    await writer.writeElementFull("xsl", "apply-templates")(async writer => {
      await writer.writeLocalAttributeValue("select", "@*");
    });
    await writer.writeElementFull("xsl", "value-of")(async writer => {
      await writer.writeLocalAttributeValue("select", ".");
    });
  });
  
  await writer.writeElementFull("xsl", "template")(async writer => {
    await writer.writeLocalAttributeValue("match", "@xml:lang");
    await writer.writeElementFull("xsl", "copy-of")(async writer => {
      await writer.writeLocalAttributeValue("select", ".");
    });
  });
  
  await writer.writeElementFull("xsl", "template")(async writer => {
    await writer.writeLocalAttributeValue("match", "sp:uri");
    await writer.writeElementFull(null, "iri")(async writer => {
      await writer.writeElementFull("xsl", "value-of")(async writer => {
        await writer.writeLocalAttributeValue("select", ".");
      });
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
  await writer.writeElementFull("xsl", "template")(async writer => {
    await writer.writeLocalAttributeValue("match", "/sp:sparql");
    await writer.writeElementFull("xsl", "apply-templates")(async writer => {
      await writer.writeLocalAttributeValue("select", "sp:results/sp:result");
    });
  });

  for (const rootTemplate of model.rootTemplates) {
    await writeRootTemplate(rootTemplate, writer);
  }
}

async function writeRootTemplate(
  rootTemplate: XmlRootTemplate,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "template")(async writer => {
    const match =
      "sp:result[sp:binding[@name=$pred]/sp:uri/text()=$type and " +
      `sp:binding[@name=$obj]/sp:uri/text()="${rootTemplate.typeIri}"]`;
    await writer.writeLocalAttributeValue("match", match);
    await writer.writeElementFull(...rootTemplate.elementName)(async writer => {
      await writer.writeElementFull("xsl", "call-template")(async writer => {
        await writer.writeLocalAttributeValue(
          "name", rootTemplate.targetTemplate
        );
        await writer.writeElementFull("xsl", "with-param")(async writer => {
          await writer.writeLocalAttributeValue("name", "id");
          await writer.writeElementFull("xsl", "copy-of")(async writer => {
            await writer.writeLocalAttributeValue(
              "select",
              "sp:binding[@name=$subj]/*"
            );
          });
        });
      });
    });
  });
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

function elementIdTest(expression: string) {
  return `concat(namespace-uri(${expression}), '|', ` +
    `local-name(${expression}), '|', string(${expression}))`;
}

async function writeTemplateContents(
  template: XmlTemplate,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "param")(async writer => {
    await writer.writeLocalAttributeValue("name", "id");
  });
  
  await writer.writeElementFull("xsl", "param")(async writer => {
    await writer.writeLocalAttributeValue("name", "type_name");
  });

  await writer.writeElementFull("xsl", "if")(async writer => {
    await writer.writeLocalAttributeValue("test", "$type_name!=''");
    await writer.writeElementFull("xsl", "attribute")(async writer => {
      await writer.writeLocalAttributeValue("name", "xsi:type");
      await writer.writeElementFull("xsl", "value-of")(async writer => {
        await writer.writeLocalAttributeValue("select", "$type_name");
      });
    });
  });

  await writer.writeElementFull("xsl", "apply-templates")(async writer => {
    await writer.writeLocalAttributeValue("select", "$id/*");
  });
  
  await writer.writeElementFull("xsl", "variable")(async writer => {
    await writer.writeLocalAttributeValue("name", "id_test");
    await writer.writeElementFull("xsl", "value-of")(async writer => {
      await writer.writeLocalAttributeValue(
        "select",
        elementIdTest("$id/*")
      );
    });
  });

  for (const match of template.propertyMatches) {
    await writeTemplateMatch(match, writer);
  }
}

async function writeTemplateMatch(
  match: XmlMatch,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "for-each")(async writer => {
    const path =
      "//sp:result[sp:binding[@name=$subj]/*[$id_test = " + elementIdTest("") +
      `] and sp:binding[@name=$pred]/sp:uri/text()="${match.propertyIri}"]`;
    await writer.writeLocalAttributeValue("select", path);
    await writer.writeElementFull(...match.propertyName)(async writer => {

      if (xmlMatchIsLiteral(match)) {
        await writer.writeElementFull("xsl", "apply-templates")(async writer => {
          await writer.writeLocalAttributeValue(
            "select",
            "sp:binding[@name=$obj]/*"
          );
        });
      } else if (xmlMatchIsCodelist(match)) {
        await writer.writeElementFull("xsl", "value-of")(async writer => {
          await writer.writeLocalAttributeValue(
            "select",
            "sp:binding[@name=$obj]/*"
          );
        });
      } else if (xmlMatchIsClass(match)) {
        // TODO dematerialized
        const templates = match.targetTemplates;
        if (templates.length == 1) {
          await writeTemplateCall(templates[0].templateName, null, writer);
        } else {
          await writer.writeElementFull("xsl", "choose")(async writer => {
            for (const template of match.targetTemplates) {
              const condition =
                "//sp:result[sp:binding[@name=$subj]/*[$id_test = " +
                elementIdTest("") +
                "] and sp:binding[@name=$pred]/sp:uri/text()=$type" + 
                `and sp:binding[@name=$obj]/sp:uri/text()=${template.typeIri}]`;
              await writer.writeElementFull("xsl", "when")(async writer => {
                await writer.writeLocalAttributeValue("test", condition);
                await writeTemplateCall(
                  template.templateName, template.typeName, writer
                );
              });
            }
          });
        }
      }
    });
  });
}

async function writeTemplateCall(
  templateName: string,
  typeName: string | null,
  writer: XmlWriter,
): Promise<void> {
  await writer.writeElementFull("xsl", "call-template")(async writer => {
    await writer.writeLocalAttributeValue("name", templateName);
    await writer.writeElementFull("xsl", "with-param")(async writer => {
      await writer.writeLocalAttributeValue("name", "id");
      await writer.writeElementFull("xsl", "copy-of")(async writer => {
        await writer.writeLocalAttributeValue(
          "select",
          "sp:binding[@name=$obj]/*"
        );
      });
    });
    if (typeName != null) {
      await writer.writeElementFull("xsl", "with-param")(async writer => {
        await writer.writeLocalAttributeValue("name", "type_name");
        await writer.writeText(typeName);
      });
    }
  });
}

async function writeIncludes(
  model: XmlTransformation,
  writer: XmlWriter
): Promise<void> {
  for (const include of model.includes) {
    const location = include.locations[XSLT_LOWERING.Generator];
    if (location != null) {
      await writer.writeElementFull("xsl", "include")(async writer => {
        await writer.writeLocalAttributeValue("href", location);
      });
    }
  }
}
