import { OutputStream } from "../io/stream/output-stream";

export interface XmlNamespaceMap {
  getQName(namespacePrefix: string, elementName: string): string;
  getPrefixForUri(uri: string): string | undefined;
  getUriForPrefix(prefix: string): string | undefined;
  registerNamespace(prefix: string, uri: string): void;
}

export interface XmlWriter extends XmlNamespaceMap {
  writeXmlDeclaration(version: string, encoding: string): Promise<void>;
  writeElementBegin(
    namespacePrefix: string,
    elementName: string
  ): Promise<void>;
  writeElementValue(
    namespacePrefix: string,
    elementName: string,
    elementValue: string
  ): Promise<void>;
  writeElementFull(
    namespacePrefix: string,
    elementName: string
  ): (content: (writer: XmlWriter) => Promise<void>) => Promise<void>;
  writeAttributeValue(
    namespacePrefix: string,
    attributeName: string,
    attributeValue: string
  ): Promise<void>;
  writeLocalAttributeValue(
    attributeName: string,
    attributeValue: string
  ): Promise<void>;
  writeNamespaceDeclaration(prefix: string, uri: string): Promise<void>;
  writeAndRegisterNamespaceDeclaration(
    prefix: string,
    uri: string
  ): Promise<void>;
  writeComment(comment: string): Promise<void>;
  writeText(text: string): Promise<void>;
  writeElementEnd(namespacePrefix: string, elementName: string): Promise<void>;
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
        throw new Error(
          `An unregistered namespace prefix ${namespacePrefix} was used.`
        );
      }
      return `${namespacePrefix}:${localName}`;
    } else {
      return localName;
    }
  }
}

/**
 * Escapes XML AttValue (see https://www.w3.org/TR/xml/#NT-AttValue)
 */
function xmlEscape(text: string): string {
  return text.replace(/[&<>"]/g, function (m) {
    return `&#${m.charCodeAt(0)};`;
  });
}

function xml(template: TemplateStringsArray, ...values: string[]): string {
  return template
    .map((value, index) => {
      return value + (values[index] ?? "");
    })
    .join("");
}

export abstract class XmlIndentingTextWriter
  extends XmlSimpleNamespaceMap
  implements XmlWriter
{
  private readonly indentSequence = "  ";
  private indentLevel = 0;
  private currentIndent = "";

  private elementTagOpen = false;

  protected abstract write(text: string): Promise<void>;
  protected abstract writeLine(text: string): Promise<void>;

  private indent(level: number): void {
    if (this.indentLevel + level < 0) {
      throw new Error("Element level mismatch!");
    }
    this.indentLevel += level;
    this.currentIndent = this.indentSequence.repeat(this.indentLevel);
  }

  private async leaveElementAttributes(): Promise<void> {
    if (this.elementTagOpen) {
      await this.writeLine(xml`>`);
      this.elementTagOpen = false;
      this.indent(1);
    }
  }

  async writeXmlDeclaration(version: string, encoding: string): Promise<void> {
    await this.leaveElementAttributes();
    await this.writeLine(
      this.currentIndent +
        xml`<?xml version="${version}" encoding="${encoding}"?>`
    );
  }

  async writeElementBegin(
    namespacePrefix: string,
    elementName: string
  ): Promise<void> {
    const qname = this.getQName(namespacePrefix, elementName);
    await this.leaveElementAttributes();
    await this.write(this.currentIndent + `<${qname}`);
    this.elementTagOpen = true;
  }

  async writeElementValue(
    namespacePrefix: string,
    elementName: string,
    elementValue: string
  ): Promise<void> {
    const qname = this.getQName(namespacePrefix, elementName);
    if (elementValue != null) {
      await this.leaveElementAttributes();
      await this.writeLine(
        this.currentIndent + `<${qname}>${xmlEscape(elementValue)}</${qname}>`
      );
    }
  }

  writeElementFull(
    namespacePrefix: string,
    elementName: string
  ): (content: (writer: XmlWriter) => Promise<void>) => Promise<void> {
    return async content => {
      await this.writeElementBegin(namespacePrefix, elementName);
      await content(this);
      await this.writeElementEnd(namespacePrefix, elementName);
    };
  }

  async writeAttributeValue(
    namespacePrefix: string,
    attributeName: string,
    attributeValue: string
  ): Promise<void> {
    if (!this.elementTagOpen) {
      throw new Error(
        "Attempting to write an attribute but no element is open."
      );
    }
    const qname = this.getQName(namespacePrefix, attributeName);
    if (attributeValue != null) {
      await this.write(` ${qname}="${xmlEscape(attributeValue)}"`);
    }
  }

  async writeLocalAttributeValue(
    attributeName: string,
    attributeValue: string
  ): Promise<void> {
    await this.writeAttributeValue(null, attributeName, attributeValue);
  }

  async writeNamespaceDeclaration(prefix: string, uri: string): Promise<void> {
    await this.writeAttributeValue("xmlns", prefix, uri);
  }

  async writeAndRegisterNamespaceDeclaration(
    prefix: string,
    uri: string
  ): Promise<void> {
    this.registerNamespace(prefix, uri);
    await this.writeAttributeValue("xmlns", prefix, uri);
  }

  async writeComment(comment: string): Promise<void> {
    await this.leaveElementAttributes();
    await this.writeLine(this.currentIndent + `<!--${comment}-->`);
  }

  async writeText(text: string): Promise<void> {
    await this.leaveElementAttributes();
    await this.write(xmlEscape(text));
  }

  async writeElementEnd(
    namespacePrefix: string,
    elementName: string
  ): Promise<void> {
    if (this.elementTagOpen) {
      await this.writeLine("/>");
      this.elementTagOpen = false;
    } else {
      const qname = this.getQName(namespacePrefix, elementName);
      this.indent(-1);
      await this.writeLine(this.currentIndent + `</${qname}>`);
    }
  }
}

export class XmlStreamWriter extends XmlIndentingTextWriter {
  private readonly stream: OutputStream;

  constructor(stream: OutputStream) {
    super();
    this.stream = stream;
  }

  protected write(text: string): Promise<void> {
    return this.stream.write(text);
  }

  protected async writeLine(text: string): Promise<void> {
    await this.stream.write(text);
    await this.stream.write("\n");
  }
}
