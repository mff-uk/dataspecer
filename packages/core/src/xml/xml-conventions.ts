/**
 * A pair of a namespace prefix and a local name.
 */
export type QName = [prefix: string | null, localName: string];
 
/**
 * The QName used for an extension of xs:string that requires xml:lang.
 */
export const langStringName: QName = [null, "langString"];
 
import { OFN, XSD } from "../well-known";

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