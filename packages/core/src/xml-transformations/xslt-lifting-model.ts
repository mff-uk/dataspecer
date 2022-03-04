export type QName = [prefix: string, localName: string];

export class XmlLiftingTransformation {
  targetNamespace: string | null;
  targetNamespacePrefix: string | null;
  rdfNamespaces: Record<string, string>;
  rootTemplates: XmlLiftingRootTemplate[];
  templates: XmlLiftingTemplate[];
}

export class XmlLiftingTemplate {
  name: string;
  propertyMatches: XmlLiftingMatch[];
}

export class XmlLiftingRootTemplate {
  elementName: QName;
  targetTemplate: string;
}

export class XmlLiftingMatch {
  propertyName: QName;
  interpretation: QName;
}

export class XmlLiftingLiteralMatch extends XmlLiftingMatch {
  dataTypeIri: string;
}

export class XmlLiftingClassMatch extends XmlLiftingMatch {
  isDematerialized: boolean;
  targetTemplate: string;
}

export function xmlLiftingMatchIsLiteral(
  match: XmlLiftingMatch
): match is XmlLiftingLiteralMatch {
  return (match as XmlLiftingLiteralMatch).dataTypeIri !== undefined;
}

export function xmlLiftingMatchIsClass(
  match: XmlLiftingMatch
): match is XmlLiftingClassMatch {
  return (match as XmlLiftingClassMatch).targetTemplate !== undefined;
}
