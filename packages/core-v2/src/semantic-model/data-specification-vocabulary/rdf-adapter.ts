import * as N3 from "n3";
import { DataFactory, Quad_Predicate, Quad_Subject } from "n3";

import { LanguageString } from "../concepts/concepts";

import { ApplicationProfile, ClassProfile, ConceptualModel } from "./model";

const IRI = DataFactory.namedNode;

const Literal = DataFactory.literal;

const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

const RDF_HAS_TYPE = IRI(RDF + "type");

const RDFS = "http://www.w3.org/2000/01/rdf-schema#";

const DCT = "http://purl.org/dc/terms/";

const DCT_STANDARD = IRI(DCT + "Standard");

const DCT_HAS_PART_OF = IRI(DCT + "isPartOf");

const PROF = "http://www.w3.org/ns/dx/prof/";

const PROF_PROFILE = IRI(PROF + "Profile");

const DSV = "https://w3id.org/dsv#";

const DSV_CONCEPTUAL_MODEL = IRI(DSV + "ConceptualModel");

const DSV_CLASS_PROFILE = IRI(DSV + "ClassProfile");

const DSV_HAS_CLASS = IRI(DSV + "class");

const DSV_HAS_CONCEPTUAL_MODEL = IRI(DSV + "model");

interface RdfAdapterConfiguration {
  prefixes: { [prefix: string]: string }
}

/**
 * Converts application profile into RDF TriG.
 * 
 * @param specification
 * @param configuration
 * @returns
 */
export async function applicationProfileToTrig(
  specification: ApplicationProfile,
  configuration: RdfAdapterConfiguration | null = null
): Promise<string> {
  if (configuration == null) {
    configuration = defaultConfiguration();
  }
  const n3Writer = new N3.Writer({ prefixes: configuration.prefixes });
  const writer = new SpecificationWriter(n3Writer, configuration);
  writer.writeApplicationProfile(specification);
  return new Promise((resolve, reject) => n3Writer.end((error, result) => {
    if (error) {
      reject(error);
    } else {
      resolve(result);
    }
  }));
}

function defaultConfiguration(): RdfAdapterConfiguration {
  return {
    "prefixes": {
      "rdf": RDF,
      "rdfs": RDFS,
      "dct": DCT,
      "dsv": DSV,
      "prof": PROF,
    },
  };
}

class SpecificationWriter {
  private writer: N3.Writer;
  private configuration: RdfAdapterConfiguration;

  constructor(writer: N3.Writer, configuration: RdfAdapterConfiguration) {
    this.writer = writer;
    this.configuration = configuration;
  }

  writeApplicationProfile(profile: ApplicationProfile) {
    this.addType(profile.iri, PROF_PROFILE);
    
    for (const model of profile.conceptualModel) {
      this.addIri(profile.iri, DSV_HAS_CONCEPTUAL_MODEL, model.iri);
      this.writeConceptualModel(model);
    }    
  }

  addType(subject:string, type: N3.NamedNode) {
    this.writer.addQuad(IRI(subject), RDF_HAS_TYPE, type);
  }

  addIri(subject:string, predicate: N3.NamedNode, value:string) {
    this.writer.addQuad(IRI(subject), predicate, IRI(value));
  }

  writeConceptualModel(model: ConceptualModel) {
    this.addType(model.iri, DSV_CONCEPTUAL_MODEL);
    for (const profile of model.classes) {
      this.addIri(profile.iri, DCT_HAS_PART_OF, model.iri);
      this.writeClassProfile(profile);
    }
  }

  writeClassProfile(profile: ClassProfile) {
    this.addType(profile.iri, DSV_CLASS_PROFILE);
    if (profile.profiledClass !== null) {
      this.addIri(profile.iri, DSV_HAS_CLASS, profile.profiledClass.iri);
    } 
  }

  writeLanguageString(
    subject: Quad_Subject,
    predicate: Quad_Predicate,
    object: LanguageString
  ) {
    const languages = [...Object.keys(object)];
    languages.sort();
    for (const language of languages) {
      this.writer.addQuad(
        subject,
        predicate,
        Literal(object[language]!, language),
      );
    }
  }

}




