/**
 * This file contains internal vocabulary for use in data-specification-vocabulary
 * package. The vocabulary is provided as 'n3' package IRI so they can be
 * easily used with 'n3'.
 */
import { DataFactory } from "n3";

const IRI = DataFactory.namedNode;

const RDF_PREFIX = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

export const RDF = {
  "type": IRI(RDF_PREFIX + "type"),
  "Property": IRI(RDF_PREFIX + "Property"),
};

const RDFS_PREFIX = "http://www.w3.org/2000/01/rdf-schema#";

export const RDFS = {
  "Class": IRI(RDFS_PREFIX + "Class"),
  "isDefinedBy": IRI(RDFS_PREFIX + "isDefinedBy"),
  "label": IRI(RDFS_PREFIX + "label"),
  "domain": IRI(RDFS_PREFIX + "domain"),
  "range": IRI(RDFS_PREFIX + "range"),
};

const DCT_PREFIX = "http://purl.org/dc/terms/";

export const DCT = {
  "Standard": IRI(DCT_PREFIX + "Standard"),
  "isPartOf": IRI(DCT_PREFIX + "isPartOf"),
};

const PROF_PREFIX = "http://www.w3.org/ns/dx/prof/";

export const PROF = {
  "Profile": IRI(PROF_PREFIX + "Profile"),
  "isProfileOf": IRI(PROF_PREFIX + "isProfileOf"),
};

const DSV_PREFIX = "https://w3id.org/dsv#";

export const DSV = {
  "ConceptualModel": IRI(DSV_PREFIX + "ConceptualModel"),
  "Profile": IRI(DSV_PREFIX + "Profile"),
  "ClassProfile": IRI(DSV_PREFIX + "ClassProfile"),
  "class": IRI(DSV_PREFIX + "class"),
  "domain": IRI(DSV_PREFIX + "domain"),
  "model": IRI(DSV_PREFIX + "model"),
  "ObjectPropertyProfile": IRI(DSV_PREFIX + "ObjectPropertyProfile"),
  "DatatypePropertyProfile": IRI(DSV_PREFIX + "DatatypePropertyProfile"),
  "property": IRI(DSV_PREFIX + "property"),
  "objectPropertyRange": IRI(DSV_PREFIX + "objectPropertyRange"),
  "datatypePropertyRange": IRI(DSV_PREFIX + "datatypePropertyRange"),
  "profileOf": IRI(DSV_PREFIX + "profileOf"),
  "cardinality": IRI(DSV_PREFIX + "cardinality"),
  "inherits": IRI(DSV_PREFIX + "inheritsProperties"),
  "ManyToMany": IRI(DSV_PREFIX + "nn"),
  "ManyToOne": IRI(DSV_PREFIX + "n1"),
  "ManyToZero": IRI(DSV_PREFIX + "n0"),
  "OneToMany": IRI(DSV_PREFIX + "1n"),
  "OneToOne": IRI(DSV_PREFIX + "11"),
  "OneToZero": IRI(DSV_PREFIX + "10"),
  "ZeroToMany": IRI(DSV_PREFIX + "0n"),
  "ZeroToOne": IRI(DSV_PREFIX + "01"),
  "ZeroToZero": IRI(DSV_PREFIX + "00"),
};

const OWL_PREFIX = "http://www.w3.org/2002/07/owl#";

export const OWL = {
  "Ontology": IRI(OWL_PREFIX + "Ontology"),
  "DataTypeProperty": IRI(OWL_PREFIX + "DataTypeProperty"),
  "ObjectProperty": IRI(OWL_PREFIX + "ObjectProperty"),
};

const SKOS_PREFIX = "http://www.w3.org/2004/02/skos/core#";

export const SKOS = {
  "prefLabel": IRI(SKOS_PREFIX + "prefLabel"),
};

const VANN_PREFIX = "http://purl.org/vocab/vann/";

export const VANN = {
  "usageNote": IRI(VANN_PREFIX + "usageNote"),
};

const PAV_PREFIX = "http://purl.org/pav/";

export const PAV = {
  "derivedFrom": IRI(PAV_PREFIX + "derivedFrom"),
};
