
type LanguageString = { [language: string]: string };

export enum DataSpecificationType {
  Dataspecer = "dataspecer",
  Vocabulary = "vocabulary",
  Broken = "broken",
}

export interface DataSpecification {

  type: DataSpecificationType;

  url: string;

  profileOf: DataSpecificationReference[];

  resources: DataSpecificationResource[];

}

export interface DataSpecificationReference {

  url: string;

}

export interface DataSpecificationResource {

  url: string;

  role: DataSpecificationResourceRole;

  format: DataSpecificationResourceFormat;

}

export enum DataSpecificationResourceRole {
  Unknown = "unknown",
  Vocabulary = "vocabulary",
  Profile = "profile",
  Guidance = "guidance",
}

export enum DataSpecificationResourceFormat {
  Unknown = "unknown",
  Turtle = "turtle",
  SVG = "svg",
  HTML = "html",
  RDFXML = "rdf+xml",
  JSONLD = "jsonld",
}

/**
 * Specification created by Dataspecer.
 */
export interface DataspecerDataSpecification extends DataSpecification {

  type: DataSpecificationType.Dataspecer;

  title: LanguageString;

  description: LanguageString;

}

export function isDataspecerDataSpecification(
  what: DataSpecification,
): what is DataspecerDataSpecification {
  return what.type === DataSpecificationType.Dataspecer;
}

/**
 * Specification in form of a single RDF file.
 */
export interface RdfDataSpecification extends DataSpecification {

  type: DataSpecificationType.Vocabulary;

}

export function isRdfSpecification(
  what: DataSpecification,
): what is RdfDataSpecification {
  return what.type === DataSpecificationType.Vocabulary;
}

/**
 * A specification we can not read.
 */
export interface BrokenDataSpecification extends DataSpecification {

  type: DataSpecificationType.Broken;

}

export function isBrokenDataSpecification(
  what: DataSpecification,
): what is BrokenDataSpecification {
  return what.type === DataSpecificationType.Broken;
}
