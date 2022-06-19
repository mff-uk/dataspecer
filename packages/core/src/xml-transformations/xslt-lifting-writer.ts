import {OutputStream} from "../io/stream/output-stream";

import {
  XmlTemplate,
  XmlTransformation,
  xmlMatchIsLiteral,
  xmlMatchIsClass,
  XmlMatch,
  xmlMatchIsCodelist,
  XmlClassMatch,
} from "./xslt-model";

import { XmlWriter, XmlStreamWriter } from "../xml/xml-writer";

import { XSLT_LIFTING } from "./xslt-vocabulary";
import { commonXmlNamespace, commonXmlPrefix, iriElementName, QName } from "../xml/xml-conventions";

const xslNamespace = "http://www.w3.org/1999/XSL/Transform";

const inverseContainer: QName = [null, "top-level"];

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
  
  if (commonXmlNamespace != null) {
    await writer.writeAndRegisterNamespaceDeclaration(
      commonXmlPrefix,
      commonXmlNamespace
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
    await writer.writeLocalAttributeValue("match", "@xml:lang");
    await writer.writeElementFull("xsl", "copy-of")(async writer => {
      await writer.writeLocalAttributeValue("select", ".");
    });
  });
  
  await writer.writeElementFull("xsl", "template")(async writer => {
    await writer.writeLocalAttributeValue("name", "remove-top");
    
    await writer.writeElementFull("xsl", "for-each")(async writer => {
      await writer.writeLocalAttributeValue("select", "@*");
  
      await writer.writeElementEmpty("xsl", "copy");
    });
    
    await writer.writeElementFull("xsl", "for-each")(async writer => {
      const path = `node()[not(. instance of element(${writer.getQName(...inverseContainer)}))]`;
      await writer.writeLocalAttributeValue("select", path);
  
      await writer.writeElementFull("xsl", "copy")(async writer => {
        await writer.writeElementFull("xsl", "call-template")(async writer => {
          await writer.writeLocalAttributeValue(
            "name", "remove-top"
          );
        });
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
  for (const rootTemplate of model.rootTemplates) {
    await writer.writeElementFull("xsl", "template")(async writer => {
      const match = "/" + writer.getQName(...rootTemplate.elementName);
      await writer.writeLocalAttributeValue("match", match);

      await writer.writeElementFull("rdf", "RDF")(async writer => {
        await writer.writeElementFull("xsl", "variable")(async writer => {
          await writer.writeLocalAttributeValue(
            "name", "result"
          );
          await writer.writeElementFull("xsl", "sequence")(async writer => {
            await writer.writeElementFull("xsl", "call-template")(async writer => {
              await writer.writeLocalAttributeValue(
                "name", rootTemplate.targetTemplate
              );
            });
          });
        });
        
        await writer.writeElementFull("xsl", "for-each")(async writer => {
          await writer.writeLocalAttributeValue("select", "$result");
      
          await writer.writeElementFull("xsl", "copy")(async writer => {
            await writer.writeElementFull("xsl", "call-template")(async writer => {
              await writer.writeLocalAttributeValue(
                "name", "remove-top"
              );
            });
          });
        });
        
        await writer.writeElementFull("xsl", "for-each")(async writer => {
          const path = `$result//${writer.getQName(...inverseContainer)}/node()`;
          await writer.writeLocalAttributeValue("select", path);
      
          await writer.writeElementFull("xsl", "copy")(async writer => {
            await writer.writeElementFull("xsl", "call-template")(async writer => {
              await writer.writeLocalAttributeValue(
                "name", "remove-top"
              );
            });
          });
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
      
      await writer.writeElementFull("xsl", "param")(async writer => {
        await writer.writeLocalAttributeValue("name", "arc");
        await writer.writeLocalAttributeValue("select", "()");
      });
      
      await writer.writeElementFull("xsl", "param")(async writer => {
        await writer.writeLocalAttributeValue("name", "no_iri");
        await writer.writeLocalAttributeValue("select", "false()");
      });
      
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
      await writer.writeLocalAttributeValue("select", "@*");
    });

    await writer.writeElementFull("xsl", "variable")(async writer => {
      await writer.writeLocalAttributeValue("name", "id");
      await writer.writeElementFull(null, "id")(async writer => {
        await writer.writeElementFull("xsl", "choose")(async writer => {
          await writer.writeElementFull("xsl", "when")(async writer => {
            const iri = writer.getQName(...iriElementName);
            const condition = `${iri} and not($no_iri)`;
            await writer.writeLocalAttributeValue("test", condition);
            await writer.writeElementFull("xsl", "attribute")(async writer => {
              await writer.writeLocalAttributeValue("name", "rdf:about");
              await writer.writeElementFull("xsl", "value-of")(async writer => {
                await writer.writeLocalAttributeValue("select", iri);
              });
            });
          });

          await writer.writeElementFull("xsl", "otherwise")(async writer => {
            await writer.writeElementFull("xsl", "attribute")(async writer => {
              await writer.writeLocalAttributeValue("name", "rdf:nodeID");
              await writer.writeElementFull("xsl", "value-of")(async writer => {
                const expression = "concat('_',generate-id())";
                await writer.writeLocalAttributeValue("select", expression);
              });
            });
          });
        });
      });
    });
    
    await writer.writeElementFull("xsl", "copy-of")(async writer => {
      await writer.writeLocalAttributeValue("select", "$id//@*");
    });
    
    if (template.classIri != null) {
      await writer.writeElementFull("rdf", "type")(async writer => {
        await writer.writeAttributeValue("rdf", "resource", template.classIri);
      });
    }
    
    await writer.writeElementFull("xsl", "copy-of")(async writer => {
      await writer.writeLocalAttributeValue("select", "$arc");
    });
    
    for (const match of template.propertyMatches) {
      await writeTemplateMatch(match, writer);
    }
  });
}

async function writeTemplateMatch(
  match: XmlMatch,
  writer: XmlWriter
): Promise<void> {
  if (xmlMatchIsClass(match) && match.isDematerialized) {
    // Possibly find the range of corresponding elements
    await writeProperty(match, writer);
  } else {
    await writer.writeElementFull("xsl", "for-each")(async writer => {
      const name = writer.getQName(...match.propertyName);
      await writer.writeLocalAttributeValue("select", name);
  
      await writeProperty(match, writer);
    });
  }
}

async function writeProperty(
  match: XmlMatch,
  writer: XmlWriter
) {
  if (match.isReverse) {
    if (!xmlMatchIsClass(match)) {
      throw new Error(
        `Reverse property ${match.propertyName} must be of a class type.`
      );
    }

    await writer.writeElementFull("xsl", "variable")(async writer => {
      await writer.writeLocalAttributeValue("name", "arc");
      await writer.writeElementFull(...match.interpretation)(async writer => {
        await writer.writeElementFull("rdf", "Description")(async writer => {
          await writer.writeElementFull("xsl", "copy-of")(async writer => {
            await writer.writeLocalAttributeValue("select", "$id//@*");
          });
        });
      });
    });

    await writer.writeElementFull(...inverseContainer)(async writer => {
      await writeClassTemplateCall(match, writer);
    });
  } else {
    await writeForwardProperty(match, writer);
  }
}

async function writeForwardProperty(
  match: XmlMatch,
  writer: XmlWriter
) {
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
    } else if (xmlMatchIsCodelist(match)) {
      await writer.writeElementFull("xsl", "attribute")(async writer => {
        await writer.writeLocalAttributeValue("name", "rdf:resource");
        await writer.writeElementFull("xsl", "value-of")(async writer => {
          await writer.writeLocalAttributeValue("select", ".");
        });
      });
    } else if (xmlMatchIsClass(match)) {
      await writeClassTemplateCall(match, writer);
    }
  });
}

async function writeClassTemplateCall(
  match: XmlClassMatch,
  writer: XmlWriter
) {
  const templates = match.targetTemplates;
  const hasArc = match.isReverse;
  if (match.isDematerialized) {
    for (const template of templates) {
      await writeTemplateCall(template.templateName, hasArc, true, writer);
    }
  } else if (templates.length == 1) {
    await writeTemplateCall(templates[0].templateName, hasArc, false, writer);
  } else {
    await writer.writeElementFull("xsl", "variable")(async writer => {
      await writer.writeLocalAttributeValue(
        "name", "type"
      );
      await writer.writeLocalAttributeValue(
        "select", "resolve-QName(@xsi:type,.)"
      );
    });
    await writer.writeElementFull("xsl", "variable")(async writer => {
      await writer.writeLocalAttributeValue(
        "name", "types"
      );
      await writer.writeElementFull("xsl", "sequence")(async writer => {
        for (const template of templates) {
          await writer.writeElementEmpty(...template.typeName);
        }
      });
    });
    await writer.writeElementFull("xsl", "choose")(async writer => {
      for (let template = 0; template < templates.length; template++) {
        await writer.writeElementFull("xsl", "when")(async writer => {
          const condition = `$type=node-name($types/*[${template + 1}])`;
          await writer.writeLocalAttributeValue("test", condition);
          await writeTemplateCall(
            templates[template].templateName, hasArc, false, writer
          );
        });
      }
    });
  }
}

async function writeTemplateCall(
  templateName: string,
  hasArc: boolean,
  noIri: boolean,
  writer: XmlWriter,
): Promise<void> {
  await writer.writeElementFull("xsl", "call-template")(async writer => {
    await writer.writeLocalAttributeValue("name", templateName);
    if (hasArc) {
      await writer.writeElementFull("xsl", "with-param")(async writer => {
        await writer.writeLocalAttributeValue("name", "arc");
        await writer.writeLocalAttributeValue("select", "$arc");
      });
    }
    if (noIri) {
      await writer.writeElementFull("xsl", "with-param")(async writer => {
        await writer.writeLocalAttributeValue("name", "no_iri");
        await writer.writeLocalAttributeValue("select", "true()");
      });
    }
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
