import * as N3 from "n3";
import { DataFactory } from "n3";

import {
  LanguageString,
  ConceptualModel,
  Profile,
  ClassProfile,
  PropertyProfile,
  ObjectPropertyProfile,
  isObjectPropertyProfile,
  DatatypePropertyProfile,
  isDatatypePropertyProfile,
  Cardinality,
} from "./dsv-model";

import { RDF, DSV, DCT, SKOS, VANN } from "./vocabulary";

const IRI = DataFactory.namedNode;

const Literal = DataFactory.literal;

interface ConceptualModelToRdfConfiguration {

  /**
   * Prefixes to use when writing RDF output.
   */
  prefixes?: { [prefix: string]: string };

  /**
   * True to do some additional formating on the output string.
   */
  prettyPrint?: boolean;

}

export async function conceptualModelToRdf(model: ConceptualModel, configuration: ConceptualModelToRdfConfiguration): Promise<string> {
  const effectiveConfiguration = {
    ...createDefaultConfiguration(),
    ...configuration,
  };
  //
  const n3Writer = new N3.Writer({ prefixes: effectiveConfiguration.prefixes });
  (new ConceptualModelWriter(n3Writer, model)).writeConceptualModel();
  // Concert to a string.
  return new Promise((resolve, reject) => n3Writer.end((error, result) => {
    if (error) {
      reject(error);
    } else {
      if (effectiveConfiguration.prettyPrint) {
        resolve(prettyPrintTurtle(result));
      } else {
        resolve(result);
      }
    }
  }));
}

function createDefaultConfiguration(): ConceptualModelToRdfConfiguration {
  return {
    "prefixes": {
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "dct": "http://purl.org/dc/terms/",
      "dsv": "https://w3id.org/dsv#",
      "owl": "http://www.w3.org/2002/07/owl#",
      "skos": "http://www.w3.org/2004/02/skos/core#",
    },
    "prettyPrint": true,
  };
}

class ConceptualModelWriter {

  private writer: N3.Writer;

  private model: ConceptualModel;

  constructor(writer: N3.Writer, model: ConceptualModel) {
    this.writer = writer;
    this.model = model;
  }

  writeConceptualModel(): void {
    this.addType(this.model.iri, DSV.ConceptualModel);
    for (const profile of this.model.profiles) {
      this.writeClassProfile(profile);
    }
  }

  private addType(subject: string, type: N3.NamedNode) {
    this.writer.addQuad(IRI(subject), RDF.type, type);
  }

  private writeClassProfile(profile: ClassProfile) {
    this.writeProfileBase(profile)
    this.addType(profile.iri, DSV.ClassProfile);
    this.addIri(profile.iri, DSV.class, profile.profiledClassIri);
    // Properties.
    for (const property of profile.properties) {
      this.addIri(property.iri, DSV.domain, profile.iri);
      //
      if (isObjectPropertyProfile(property)) {
        this.writeObjectPropertyProfile(property);
      }
      if (isDatatypePropertyProfile(property)) {
        this.writeDatatypePropertyProfile(property);
      }
    }
  }

  private writeProfileBase(profile: Profile) {
    this.addIri(profile.iri, DCT.isPartOf, this.model.iri);
    this.addType(profile.iri, DSV.Profile);
    //
    this.addStringProperty(profile.iri, SKOS.prefLabel, profile.prefLabel);
    this.addStringProperty(profile.iri, VANN.usageNote, profile.usageNote);
    // We do not write this into properties.
    this.addIri(profile.iri, DSV.profileOf, profile.profileOfIri);
  }

  private addIri(subject: string, predicate: N3.NamedNode, value: string | null) {
    if (value === null) {
      return;
    }
    this.writer.addQuad(IRI(subject), predicate, IRI(value));
  }

  /**
   * When value is null add to an inheritance list.
   */
  private addStringProperty(subject: string, predicate: N3.NamedNode, string: LanguageString | null) {
    if (string === null) {
      this.writer.addQuad(IRI(subject), DSV.inherits, predicate);
      return;
    }
    for (const [lang, value] of Object.entries(string)) {
      this.writer.addQuad(IRI(subject), predicate, Literal(value, lang));
    }
  }

  /**
   * When value is null add to an inheritance list.
   */
  private addIriProperty(subject: string, predicate: N3.NamedNode, value: N3.NamedNode<string> | string | null) {
    if (value === null) {
      this.writer.addQuad(IRI(subject), DSV.inherits, predicate);
      return;
    }
    if (typeof value === 'string') {
      this.writer.addQuad(IRI(subject), predicate, IRI(value));
    } else {
      this.writer.addQuad(IRI(subject), predicate, value);
    }

  }

  private writePropertyProfileBase(profile: PropertyProfile) {
    this.writeProfileBase(profile);
    this.addIriProperty(profile.iri, DSV.cardinality, cardinalityToIri(profile.cardinality));
    this.addIriProperty(profile.iri, DSV.property, profile.profiledPropertyIri);
  }

  writeObjectPropertyProfile(profile: ObjectPropertyProfile) {
    this.writePropertyProfileBase(profile);
    this.addType(profile.iri, DSV.ObjectPropertyProfile);
    //
    for (const iri of profile.rangeClassIri) {
      this.addIriProperty(profile.iri, DSV.objectPropertyRange, iri);
    }
  }

  writeDatatypePropertyProfile(profile: DatatypePropertyProfile) {
    this.writePropertyProfileBase(profile);
    this.addType(profile.iri, DSV.DatatypePropertyProfile);
    //
    for (const iri of profile.rangeDataTypeIri) {
      this.addIriProperty(profile.iri, DSV.datatypePropertyRange, iri);
    }
  }

}

function cardinalityToIri(cardinality: Cardinality | null): N3.NamedNode<string> | null {
  if (cardinality === null) {
    return null;
  }
  switch (cardinality) {
    case Cardinality.ManyToMany:
      return DSV.ManyToMany;
    case Cardinality.ManyToOne:
      return DSV.ManyToOne;
    case Cardinality.ManyToZero:
      return DSV.ManyToZero;
    case Cardinality.OneToMany:
      return DSV.OneToMany;
    case Cardinality.OneToOne:
      return DSV.OneToOne;
    case Cardinality.OneToZero:
      return DSV.OneToZero;
    case Cardinality.ZeroToMany:
      return DSV.ZeroToMany;
    case Cardinality.ZeroToOne:
      return DSV.ZeroToOne;
    case Cardinality.ZeroToZero:
      return DSV.ZeroToZero;
  }
}

/**
 * Add an empty line before each resource section.
 */
function prettyPrintTurtle(turtle: string): string {
  const lines = turtle.split(/\r?\n|\r|\n/g);
  const linesNext = [];
  for (const line of lines) {
    if (line.startsWith("<")) {
      linesNext.push("");
    }
    linesNext.push(line);
  }
  return linesNext.join("\n");
}
