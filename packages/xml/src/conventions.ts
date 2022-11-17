/**
 * A pair of a namespace prefix and a local name.
 */
export type QName = [prefix: string | null, localName: string];
 
/**
 * The QName used for an extension of xs:string that requires xml:lang.
 */
export const langStringName: QName = [null, "langString"];
 
import { OFN, XSD } from "@dataspecer/core/well-known";

/**
 * Namespace IRI containing common XML elements, such as {@link iriElementName}.
 */
export const commonXmlNamespace =
  "https://schemas.dataspecer.com/xsd/core/";

/**
 * Namespace prefix for {@link commonXmlNamespace}.
 */
export const commonXmlPrefix = "c";

/**
 * Schema location URL for {@link commonXmlNamespace}.
 */
export const commonXmlSchema =
  "https://schemas.dataspecer.com/xsd/core/2022-07.xsd";

/**
 * Name of the element containing the IRI of an instance.
 */
export const iriElementName: QName = [commonXmlPrefix, "iri"];

 /**
 * Map from datatype URIs to QNames.
 */
export const simpleTypeMapQName: Record<string, QName> = {
  [OFN.boolean]: ["xs", "boolean"],
  [OFN.date]: ["xs", "date"],
  [OFN.time]: ["xs", "time"],
  [OFN.dateTime]: ["xs", "dateTimeStamp"],
  [OFN.integer]: ["xs", "integer"],
  [OFN.decimal]: ["xs", "decimal"],
  [OFN.url]: ["xs", "anyURI"],
  [OFN.string]: ["xs", "string"],
  [OFN.text]: langStringName,
};

/**
 * Map from common datatype URIs to XSD datatypes.
 */
export const simpleTypeMapIri: Record<string, string> = {
  [OFN.boolean]: XSD.boolean,
  [OFN.date]: XSD.date,
  [OFN.time]: XSD.time,
  [OFN.dateTime]: XSD.dateTimeStamp,
  [OFN.integer]: XSD.integer,
  [OFN.decimal]: XSD.decimal,
  [OFN.url]: XSD.anyURI,
  [OFN.string]: XSD.string,
};

/**
 * Splits IRI to a namespace part and local part.
 */
export function namespaceFromIri(
  iri: string
): [namespaceIri: string, localName: string] | null {
  const match = iri.match(/^(.+?)([_\p{L}][-_\p{L}\p{N}]*)$/u);
  if (match == null) {
    return null;
  }
  return [match[1], match[2]];
}
