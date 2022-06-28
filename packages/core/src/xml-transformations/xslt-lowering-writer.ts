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
import { commonXmlNamespace, commonXmlPrefix, iriElementName, QName } from "../xml/xml-conventions";

const xslNamespace = "http://www.w3.org/1999/XSL/Transform";

/**
 * Writes out a lowering transformation.
 */
export async function writeXsltLowering(
  model: XmlTransformation,
  stream: OutputStream
): Promise<void> {
  const writer = new XmlStreamWriter(stream);
  await writeTransformationBegin(model, writer);
  await writeImports(model, writer);
  await writeSettings(writer);
  await writeRootTemplates(model, writer);
  await writeCommonTemplates(writer);
  await writeTemplates(model, writer);
  await writeFinalTemplates(writer);
  await writeTransformationEnd(writer);
}

/**
 * Writes the beginning of the transformation, including the XML declaration,
 * transformation definition and options, and declares used namespaces.  
 */
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
  
  if (commonXmlNamespace != null) {
    await writer.writeAndRegisterNamespaceDeclaration(
      commonXmlPrefix,
      commonXmlNamespace
    );
  }
}

/**
 * Writes the settings and parameters of the transformation.
 */
async function writeSettings(
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "output")(async writer => {
    await writer.writeLocalAttributeValue("method", "xml");
    await writer.writeLocalAttributeValue("version", "1.0");
    await writer.writeLocalAttributeValue("encoding", "utf-8");
    await writer.writeLocalAttributeValue("indent", "yes");
  })
  
  // The SPARQL variable binding names are configurable if necessary.

  await writer.writeElementFull("xsl", "param")(async writer => {
    await writer.writeLocalAttributeValue("name", "subj");
    await writer.writeLocalAttributeValue("select", "'s'");
  });
  
  await writer.writeElementFull("xsl", "param")(async writer => {
    await writer.writeLocalAttributeValue("name", "pred");
    await writer.writeLocalAttributeValue("select", "'p'");
  });
  
  await writer.writeElementFull("xsl", "param")(async writer => {
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
  
  // The id-key function is applied on contents of variable bindings to
  // produce a string identifier from it, to compare by value
  // with other bindings.
  await writer.writeElementFull("xsl", "function")(async writer => {
    const name = writer.getQName(commonXmlPrefix, "id-key");
    await writer.writeLocalAttributeValue("name", name);
    await writer.writeElementFull("xsl", "param")(async writer => {
      await writer.writeLocalAttributeValue("name", "node");
    });
    await writer.writeElementFull("xsl", "value-of")(async writer => {
      const expression = "concat(namespace-uri($node),'|'," +
      "local-name($node),'|',string($node))";
      await writer.writeLocalAttributeValue("select", expression);
    });
  });
}

/**
 * Returns a call to id-key using {@link expression}.
 */
function elementIdTest(
  expression: string,
  writer: XmlWriter
) {
  const name = writer.getQName(commonXmlPrefix, "id-key");
  return `${name}(${expression})`;
}

/**
 * Writes the end of the transformation.
 */
async function writeTransformationEnd(writer: XmlWriter): Promise<void> {
  await writer.writeElementEnd("xsl", "stylesheet");
}

/**
 * Writes common templates used from other places.
 */
async function writeCommonTemplates(
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "template")(async writer => {
    // An xml:lang attribute is copied when encountered.
    await writer.writeLocalAttributeValue("match", "@xml:lang");
    await writer.writeElementFull("xsl", "copy-of")(async writer => {
      await writer.writeLocalAttributeValue("select", ".");
    });
  });

  await writer.writeElementFull("xsl", "template")(async writer => {
    // An sp:literal element is converted to its value, including xml:lang.
    await writer.writeLocalAttributeValue("match", "sp:literal");
    await writer.writeElementFull("xsl", "apply-templates")(async writer => {
      await writer.writeLocalAttributeValue("select", "@*");
    });
    await writer.writeElementFull("xsl", "value-of")(async writer => {
      await writer.writeLocalAttributeValue("select", ".");
    });
  });
  
  await writer.writeElementFull("xsl", "template")(async writer => {
    // An sp:uri element is converted to its value.
    await writer.writeLocalAttributeValue("match", "sp:uri");
    await writer.writeElementFull("xsl", "value-of")(async writer => {
      await writer.writeLocalAttributeValue("select", ".");
    });
  });
}

/**
 * Writes the fallback template.
 */
async function writeFinalTemplates(
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "template")(async writer => {
    await writer.writeLocalAttributeValue("match", "@*|*");
  });
}

/**
 * Writes the root templates of the transformation.
 */
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

/**
 * Writes out a root template.
 */
async function writeRootTemplate(
  rootTemplate: XmlRootTemplate,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "template")(async writer => {
    // Matches a result with rdf:type predicate and the class IRI.
    const match =
      "sp:result[sp:binding[@name=$pred]/sp:uri/text()=$type and " +
      `sp:binding[@name=$obj]/sp:uri/text()="${rootTemplate.classIri}"]`;
    await writer.writeLocalAttributeValue("match", match);
    await writer.writeElementFull(...rootTemplate.elementName)(async writer => {
      // Call the named template, passing the subject binding as the id.
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

/**
 * Writes out the named templates in a transformation. 
 */
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

/**
 * Writes out the contents of a named template.
 */
async function writeTemplateContents(
  template: XmlTemplate,
  writer: XmlWriter
): Promise<void> {
  // The SPARQL binding content containing the identifier of the resource.
  await writer.writeElementFull("xsl", "param")(async writer => {
    await writer.writeLocalAttributeValue("name", "id");
  });
  
  // The value of the xsi:type attribute.
  await writer.writeElementFull("xsl", "param")(async writer => {
    await writer.writeLocalAttributeValue("name", "type_name");
    await writer.writeLocalAttributeValue("select", "()");
  });
  
  // Do not match <iri>.
  await writer.writeElementFull("xsl", "param")(async writer => {
    await writer.writeLocalAttributeValue("name", "no_iri");
    await writer.writeLocalAttributeValue("select", "false()");
  });

  // Add xsi:type if specified.
  await writer.writeElementFull("xsl", "if")(async writer => {
    await writer.writeLocalAttributeValue("test", "not(empty($type_name))");
    await writer.writeElementFull("xsl", "attribute")(async writer => {
      await writer.writeLocalAttributeValue("name", "xsi:type");
      await writer.writeElementFull("xsl", "value-of")(async writer => {
        await writer.writeLocalAttributeValue("select", "$type_name");
      });
    });
  });
  
  // Write out <iri> if the identifier is sp:uri.
  await writer.writeElementFull("xsl", "if")(async writer => {
    await writer.writeLocalAttributeValue("test", "not($no_iri)");
    await writer.writeElementFull("xsl", "for-each")(async writer => {
      await writer.writeLocalAttributeValue("select", "$id/sp:uri");
  
      await writer.writeElementFull(...iriElementName)(async writer => {
        await writer.writeElementFull("xsl", "value-of")(async writer => {
          await writer.writeLocalAttributeValue("select", ".");
        });
      });
    });
  });
  
  // Converts the identifier to string for testing.
  await writer.writeElementFull("xsl", "variable")(async writer => {
    await writer.writeLocalAttributeValue("name", "id_test");
    await writer.writeElementFull("xsl", "value-of")(async writer => {
      await writer.writeLocalAttributeValue(
        "select",
        elementIdTest("$id/*", writer)
      );
    });
  });

  for (const match of template.propertyMatches) {
    await writeTemplateMatch(match, writer);
  }
}

/**
 * Writes out a property match from a template.
 */
async function writeTemplateMatch(
  match: XmlMatch,
  writer: XmlWriter
): Promise<void> {
  await writer.writeElementFull("xsl", "for-each")(async writer => {
    // Flip subject and object binding for reverse property.
    const [subj, obj] = match.isReverse ? ["$obj", "$subj"] : ["$subj", "$obj"];

    // Look for results with the same "subject" binding and the property IRI.
    const path =
      `//sp:result[sp:binding[@name=${subj}]/*[$id_test = ` +
      elementIdTest(".", writer) +
      `] and sp:binding[@name=$pred]/sp:uri/text()="${match.propertyIri}"]`;
    
    await writer.writeLocalAttributeValue("select", path);

    if (xmlMatchIsClass(match) && match.isDematerialized) {
      // Do not write property tags, only the contents.
      await writePropertyContents(match, obj, writer);
    } else {
      await writer.writeElementFull(...match.propertyName)(async writer => {
        await writePropertyContents(match, obj, writer);
      });
    }
  });
}

/**
 * Writes out an XML property contents. 
 */
async function writePropertyContents(
  match: XmlMatch,
  obj: string,
  writer: XmlWriter
): Promise<void> {
  if (xmlMatchIsLiteral(match)) {
    await writer.writeElementFull("xsl", "apply-templates")(async writer => {
      await writer.writeLocalAttributeValue(
        "select",
        `sp:binding[@name=${obj}]/sp:literal`
      );
    });
  } else if (xmlMatchIsCodelist(match)) {
    await writer.writeElementFull("xsl", "apply-templates")(async writer => {
      await writer.writeLocalAttributeValue(
        "select",
        `sp:binding[@name=${obj}]/sp:uri`
      );
    });
  } else if (xmlMatchIsClass(match)) {
    const noIri = match.isDematerialized;
    const templates = match.targetTemplates;
    if (templates.length == 1) {
      await writeTemplateCall(
        templates[0].templateName, null, noIri, obj, writer
      );
    } else {
      await writer.writeElementFull("xsl", "choose")(async writer => {
        for (const template of match.targetTemplates) {
          // Test if there is a result with the subject binding matching the
          // current object, and it has rdf:type of the class IRI.
          const condition =
            `//sp:result[sp:binding[@name=$subj]/*[$id_test = ` +
            elementIdTest(`current()/sp:binding[@name=${obj}]/*`, writer) +
            "] and sp:binding[@name=$pred]/sp:uri/text()=$type and " + 
            `sp:binding[@name=$obj]/sp:uri/text()="${template.classIri}"]`;
          await writer.writeElementFull("xsl", "when")(async writer => {
            await writer.writeLocalAttributeValue("test", condition);
            await writeTemplateCall(
              template.templateName, template.typeName, noIri, obj, writer
            );
          });
        }
      });
    }
  }
}

/**
 * Writes out a call to a named template.
 * @param templateName The name of the template.
 * @param typeName Set $type_name to the {@link QName} to use for xsi:type.
 * @param noIri Whether to set $no_iri to true.
 * @param obj The object binding, to obtain the identifier.
 * @param writer The XML writer.
 */
async function writeTemplateCall(
  templateName: string,
  typeName: QName | null,
  noIri: boolean,
  obj: string,
  writer: XmlWriter,
): Promise<void> {
  await writer.writeElementFull("xsl", "call-template")(async writer => {
    await writer.writeLocalAttributeValue("name", templateName);
    await writer.writeElementFull("xsl", "with-param")(async writer => {
      await writer.writeLocalAttributeValue("name", "id");
      await writer.writeElementFull("xsl", "copy-of")(async writer => {
        await writer.writeLocalAttributeValue(
          "select",
          `sp:binding[@name=${obj}]/*`
        );
      });
    });
    if (typeName != null) {
      await writer.writeElementFull("xsl", "with-param")(async writer => {
        await writer.writeLocalAttributeValue("name", "type_name");
        const type = writer.getQName(...typeName);
        await writer.writeLocalAttributeValue("select", `"${type}"`);
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

/**
 * Writes out the imports to external lowering transformations.
 */
async function writeImports(
  model: XmlTransformation,
  writer: XmlWriter
): Promise<void> {
  for (const include of model.imports) {
    const location = include.locations[XSLT_LOWERING.Generator];
    if (location != null) {
      await writer.writeElementFull("xsl", "import")(async writer => {
        await writer.writeLocalAttributeValue("href", location);
      });
    }
  }
}
