//
// In this file we use @lc- annotations. The idea
// is to be able to collect the information automatically
// and hopefully, one day, be able to integrate it with the specification.
//

export type LanguageString = { [language: string]: string };

export interface ConceptualModel {
  iri: string;

  // @lc-identifier dcterms:isPartOf
  profiles: ClassProfile[];
}

export enum Cardinality {
  ZeroToZero = "0-0",
  ZeroToOne = "0-1",
  ZeroToMany = "0-n",
  OneToZero = "1-0",
  OneToOne = "1-1",
  OneToMany = "1-n",
  ManyToZero = "n-0",
  ManyToOne = "n-1",
  ManyToMany = "n-n"
}

// @lc-identifier dsv:Profile
export interface Profile {
  iri: string;

  // @lc-identifier skos:prefLabel
  prefLabel: LanguageString | null;

  // @lc-identifier skos:definition
  definition: LanguageString | null;

  // @lc-identifier vann:usageNote
  usageNote: LanguageString | null;

  // @lc-identifier dsv:profileOf
  // @lc-type Profile
  profileOfIri: string[];

  // @lc-identifier dsv:inheritsValue
  // @lc-type PropertyInheritance
  inheritsValue: PropertyInheritance[];

}

// @lc-identifier dsv:PropertyInheritance
export interface PropertyInheritance {

  // dsv:inheritedProperty
  inheritedPropertyIri: string;

  // dsv:valueFrom
  propertyValueFromIri: string;

}

// @lc-identifier dsv:InvalidProfile
export interface InvalidProfile extends Profile {

}

// @lc-identifier dsv:ClassProfile
export interface ClassProfile extends Profile {
  $type: [typeof ClassProfileType];

  // @lc-identifier dsv:class
  // @lc-type ConceptualClass
  profiledClassIri: string[];

  // @lc-identifier dsv:domain
  properties: PropertyProfile[];

}

export const ClassProfileType = "class-profile";

export function isClassProfile(profile:Profile) : profile is ClassProfile {
  return ((profile as any).$type ?? []).includes(ClassProfileType);
}

// @lc-identifier dsv:PropertyProfile
export interface PropertyProfile extends Profile {

  // @ls-identifier dsv:cardinality
  cardinality: Cardinality | null;

  // @lc-identifier dsv:property
  // @lc-type ConceptualProperty
  profiledPropertyIri: string[];

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

export function isObjectPropertyProfile(
  profile:Profile,
) : profile is ObjectPropertyProfile {
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

export function isDatatypePropertyProfile(
  profile:Profile,
) : profile is DatatypePropertyProfile {
  return ((profile as any).$type ?? []).includes(DatatypePropertyProfileType);
}
