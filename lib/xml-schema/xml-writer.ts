import {WriteStream} from "fs";

export interface XmlNamespaceMap {
  getQName(namespacePrefix: string, elementName: string): string;
  getPrefixForUri(uri: string): string | undefined;
  getUriForPrefix(prefix: string): string | undefined;
  registerNamespace(prefix: string, uri: string): void;
}

export interface XmlWriter extends XmlNamespaceMap {
  writeXmlDeclaration(version: string, encoding: string): void;
  writeElementBegin(namespacePrefix: string, elementName: string): void;
  writeElementValue(namespacePrefix: string, elementName: string, elementValue: string): void;
  writeAttributeValue(namespacePrefix: string, attributeName: string, attributeValue: string): void;
  writeLocalAttributeValue(attributeName: string, attributeValue: string): void;
  writeNamespaceDeclaration(prefix: string, uri: string): void;
  writeComment(comment: string): void;
  writeText(text: string): void;
  writeElementEnd(namespacePrefix: string, elementName: string): void;
}

class XmlSimpleNamespaceMap implements XmlNamespaceMap {
  private readonly prefixToUri: Record<string, string>;

  constructor() {
    this.prefixToUri = {};

    // Reserved prefixes per https://www.w3.org/TR/REC-xml-names/#xmlReserved
    this.registerNamespace("xml", "http://www.w3.org/XML/1998/namespace");
    this.registerNamespace("xmlns", "http://www.w3.org/2000/xmlns/");
  }

  getPrefixForUri(uri: string): string | undefined {
    for (const prefix of Object.keys(this.prefixToUri)) {
      const prefixUri = this.prefixToUri[prefix];
      if (prefixUri === uri) {
        return prefixUri;
      }
    }
    return undefined;
  }

  getUriForPrefix(prefix: string): string | undefined {
    return this.prefixToUri[prefix];
  }

  registerNamespace(prefix: string, uri: string): void {
    if (prefix == null || prefix === "") {
      throw new Error("Prefix must be defined.");
    }
    if (uri == null || uri === "") {
      delete this.prefixToUri[prefix];
    }
    this.prefixToUri[prefix] = uri;
  }

  getQName(namespacePrefix: string, localName: string): string {
    if (namespacePrefix != null) {
      if (this.getUriForPrefix(namespacePrefix) == null) {
        throw new Error(`An unregistered namespace prefix ${namespacePrefix} was used.`);
      }
      return `${namespacePrefix}:${localName}`;
    } else {
      return localName;
    }
  }
}

// escapes XML AttValue (see https://www.w3.org/TR/xml/#NT-AttValue)
function xmlEscape(text: string): string {
  return text.replace(/[&<>"']/g, function(m) {
    return `&#${m.charCodeAt(0)};`
  });
}

function xml(template: TemplateStringsArray, ...values: string[]): string {
  return template.map((value, index) => {
    return value + (values[index] ?? '');
  }).join("");
}

export abstract class XmlIndentingTextWriter extends XmlSimpleNamespaceMap implements XmlWriter {
  private readonly indentSequence = "  ";
  private indentLevel = 0;
  private currentIndent: string = "";

  private elementTagOpen: boolean = false;

  protected abstract write(text: string): void;
  protected abstract writeLine(text: string): void;

  private indent(level: number): void {
    if (this.indentLevel + level < 0) {
      throw new Error("Element level mismatch!");
    }
    this.indentLevel += level;
    this.currentIndent = this.indentSequence.repeat(this.indentLevel);
  }

  private leaveElementAttributes(): void {
    if (this.elementTagOpen) {
      this.writeLine(xml`>`);
      this.elementTagOpen = false;
      this.indent(1);
    }
  }

  writeXmlDeclaration(version: string, encoding: string): void {
    this.leaveElementAttributes();
    this.writeLine(this.currentIndent + xml`<?xml version="${version}" encoding="${encoding}"?>`);
  }
  
  writeElementBegin(namespacePrefix: string, elementName: string): void {
    const qname = this.getQName(namespacePrefix, elementName);
    this.leaveElementAttributes();
    this.write(this.currentIndent + `<${qname}`);
  }
  
  writeElementValue(namespacePrefix: string, elementName: string, elementValue: string): void {
    const qname = this.getQName(namespacePrefix, elementName);
    this.leaveElementAttributes();
    this.writeLine(this.currentIndent + `<${qname}>${xmlEscape(elementValue)}</${qname}>`);
  }
  
  writeAttributeValue(namespacePrefix: string, attributeName: string, attributeValue: string): void {
    if (!this.elementTagOpen) {
      throw new Error("Attempting to write an attribute but no element is open.");
    }
    const qname = this.getQName(namespacePrefix, attributeName);
    this.write(` ${qname}="${xmlEscape(attributeValue)}"`);
  }

  writeLocalAttributeValue(attributeName: string, attributeValue: string): void {
    this.writeAttributeValue(null, attributeName, attributeValue);
  }

  writeNamespaceDeclaration(prefix: string, uri: string): void {
    this.writeAttributeValue("xmlns", prefix, uri);
  }
  
  writeComment(comment: string): void {
    this.leaveElementAttributes();
    this.writeLine(this.currentIndent + `<!--${comment}-->`);
  }
  
  writeText(text: string): void {
    this.leaveElementAttributes();
    this.write(xmlEscape(text));
  }
  
  writeElementEnd(namespacePrefix: string, elementName: string): void {
    if (this.elementTagOpen) {
      this.writeLine("/>");
    } else {
      const qname = this.getQName(namespacePrefix, elementName);
      this.indent(-1);
      this.writeLine(`</${qname}>`);
    }
  }
}

export class XmlWriteStreamWriter extends XmlIndentingTextWriter {
  private readonly writer: WriteStream;

  constructor(stream: WriteStream) {
    super();
    this.writer = stream;
  }

  protected write(text: string): void {
    this.writer.write(text);
  }

  protected writeLine(text: string): void {
    this.writer.write(text);
    this.writer.write("\n");
  }
}
