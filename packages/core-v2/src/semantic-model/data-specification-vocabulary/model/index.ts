
export type LanguageString = { [language: string]: string };

// @lc-entity 
// @lc-identifier prof:ResourceDescriptor
export interface ResourceDescriptor {
  iri: string;
}

export interface DataStructure {
  iri: string;

}

// -------------------------------------------------------------------------- //
// Vocabulary                                                                 //
// -------------------------------------------------------------------------- //

// @lc-identifier rdfs:Class
export interface ConceptualClass {
  iri: string;
}

// @lc-identifier rdf:Property
export interface ConceptualProperty {
  iri: string;
}

// @lc-identifier owl:DataTypeProperty
export interface ConceptualAttribute extends ConceptualProperty {
  $type: [typeof ConceptualAttributeType];
}

export const ConceptualAttributeType = "conceptual-attribute";

export function isConceptualAttribute(property:ConceptualProperty) : property is ConceptualAttribute {
  return ((property as any).$type ?? []).includes(ConceptualAttributeType);
}

// @lc-identifier owl:ObjectProperty
export interface ConceptualRelationship extends ConceptualProperty {
  $type: [typeof ConceptualRelationshipType];

  // @lc-identifier rdfs:label
  label: LanguageString | null;

  // @lc-identifier rdfs:domain
  domainIri: string | null;

  // @lc-identifier rdfs:range
  rangeIri: string | null;
}

export const ConceptualRelationshipType = "conceptual-relationship";

export function isConceptualRelationship(property:ConceptualProperty) : property is ConceptualRelationship {
  return ((property as any).$type ?? []).includes(ConceptualRelationshipType);
}

// @lc-identifier rdfs:Datatype
export interface ConceptualDatatype {
  iri: string;

}

// -------------------------------------------------------------------------- //
// Profile                                                                    //
// -------------------------------------------------------------------------- //

export interface ConceptualModel {
  iri: string;

  // @lc-identifier dcterms:isPartOf
  profiles: Profile[];
}


// @lc-identifier dsv:Profile
export interface Profile {
  iri: string;

  // @lc-identifier skos:prefLabel
  prefLabel: LanguageString | null | null;

  // @lc-identifier vann:usageNote
  usageNote: LanguageString | null;

  // @lc-identifier defaultTechnicalLabel
  defaultTechnicalLabel: string | null;

  // @lc-identifier dsv:profileOf
  // @lc-type Profile
  profileOfIri: string | null;

  // @lc-identifier dsv:specializes
  // @lc-type Profile
  specializesProfileIri: string | null;
}

// @lc-identifier dsv:InvalidProfile
export interface InvalidProfile extends Profile {

}

// @lc-identifier dsv:ClassProfile
export interface ClassProfile extends Profile {
  $type: [typeof ClassProfileType];

  // @lc-identifier dsv:class
  // @lc-type ConceptualClass
  profiledClassIri: string | null;

  // @lc-identifier dsv:domain
  properties: PropertyProfile[];

}

export const ClassProfileType = "class-profile";

export function isClassProfile(profile:ConceptualProperty) : profile is ClassProfile {
  return ((profile as any).$type ?? []).includes(ClassProfileType);
}

// @lc-identifier dsv:PropertyProfile 
export interface PropertyProfile extends Profile {

  // @lc-identifier dsv:property
  // @lc-type ConceptualProperty
  profiledPropertyIri: string | null;

  // @lc-identifier dsv:requiredVocabulary
  // @lc-type ControlledVocabulary
  requiredVocabulary: string[];

  // @lc-identifier dsv:additionalVocabulary
  // @lc-type ControlledVocabulary
  additionalVocabulary: string[];
}

// @lc-identifier dsv:ObjectPropertyProfile
export interface ObjectPropertyProfile extends PropertyProfile {
  $type: [typeof ObjectPropertyProfileType];

  // @lc-identifier dsv:objectPropertyRange
  // @lc-type ClassProfile | ConceptualClass
  // https://github.com/mff-uk/data-specification-vocabulary/issues/3
  rangeClassIri: string[];
}

export const ObjectPropertyProfileType = "object-property-profile";

export function isObjectPropertyProfile(profile:ConceptualProperty) : profile is ObjectPropertyProfile {
  return ((profile as any).$type ?? []).includes(ObjectPropertyProfileType);
}

// @lc-identifier dsv:DatatypePropertyProfile
export interface DatatypePropertyProfile extends PropertyProfile {
  $type: [typeof DatatypePropertyProfileType];

  // @lc-identifier dsv:datatypePropertyRange
  // @lc-type ConceptualDatatype
  rangeDataTypeIri: string[];
}

export const DatatypePropertyProfileType = "datatype-property-profile";

export function isDatatypePropertyProfile(profile:ConceptualProperty) : profile is DatatypePropertyProfile {
  return ((profile as any).$type ?? []).includes(DatatypePropertyProfileType);
}

// @lc-identifier dsv:ControlledVocabulary
export interface ControlledVocabulary { // extends skos:ConceptScheme
  iri: string;

}

// -------------------------------------------------------------------------- //
// Data specification                                                         //
// -------------------------------------------------------------------------- //

// @lc-identifier dcterms:Standard
export interface DataSpecification {
  iri: string;

  // @lc-identifier pav:previousVersion
  previousVersionIri: string | null;

  // @lc-identifier pav:derivedFrom
  reUsedSpecificationIri: string[];

  // @lc-identifier dsv:ControlledVocabulary
  controlledVocabulary: ControlledVocabulary[];

  // @lc-identifier dsv:dataStructure
  dataStructure: DataStructure[];

  // @lc-identifier dsv:artefact
  artefact: ResourceDescriptor[];
}

// @lc-identifier owl:Ontology
export interface Vocabulary extends DataSpecification {
  $type: [typeof VocabularyType];

  // @lc-identifier rdfs:idDefinedBy
  properties: ConceptualProperty[];

  // @lc-identifier rdfs:idDefinedBy
  classes: ConceptualClass[];
}

export const VocabularyType = "vocabulary";

export function isVocabulary(specification: DataSpecification): specification is Vocabulary {
  return ((specification as any).$type ?? []).includes(VocabularyType);
}

// @lc-identifier prof:Profile
export interface ApplicationProfile extends DataSpecification {
  $type: [typeof ApplicationProfileType];

  // @lc-identifier dsv:model
  model: ConceptualModel;

  // @lc-identifier prof:isProfileOf
  applicationProfileOfIri: string[];
}

export const ApplicationProfileType = "application-profile";

export function isApplicationProfile(specification: DataSpecification): specification is ApplicationProfile {
  return ((specification as any).$type ?? []).includes(ApplicationProfileType);
}
