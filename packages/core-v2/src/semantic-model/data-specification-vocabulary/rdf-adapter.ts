import * as N3 from "n3";
import { DataFactory, Quad_Predicate, Quad_Subject } from "n3";

import {
  LanguageString,
  //
  ConceptualClass,
  ConceptualAttribute,
  isConceptualAttribute,
  ConceptualRelationship,
  isConceptualRelationship,
  ConceptualDatatype,
  //
  ConceptualModel,
  Profile,
  ClassProfile,
  isClassProfile,
  PropertyProfile,
  ObjectPropertyProfile,
  isObjectPropertyProfile,
  DatatypePropertyProfile,
  isDatatypePropertyProfile,
  ControlledVocabulary,
  //
  DataSpecification,
  Vocabulary,
  isVocabulary,
  ApplicationProfile,
  isApplicationProfile,
} from "./model/";

const IRI = DataFactory.namedNode;

const Literal = DataFactory.literal;

const RDF = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";

const RDF_HAS_TYPE = IRI(RDF + "type");

const RDF_PROPERTY = IRI(RDF + "Property");

const RDFS = "http://www.w3.org/2000/01/rdf-schema#";

const RDFS_CLASS = IRI(RDFS + "Class");

const RDFS_IS_DEFINED_BY = IRI(RDFS + "idDefinedBy");

const RDFS_LABEL = IRI(RDFS + "label");

const RDFS_DOMAIN = IRI(RDFS + "domain");

const RDFS_RANGE = IRI(RDFS + "range");

const DCT = "http://purl.org/dc/terms/";

const DCT_STANDARD = IRI(DCT + "Standard");

const DCT_IS_PART_OF = IRI(DCT + "isPartOf");

const PROF = "http://www.w3.org/ns/dx/prof/";

const PROF_PROFILE = IRI(PROF + "Profile");

const PROF_IS_PROFILE_OF = IRI(PROF + "isProfileOf");

const DSV = "https://w3id.org/dsv#";

const DSV_CONCEPTUAL_MODEL = IRI(DSV + "ConceptualModel");

const DSV_CLASS_PROFILE = IRI(DSV + "ClassProfile");

const DSV_HAS_CLASS = IRI(DSV + "class");

const DSV_HAS_CONCEPTUAL_MODEL = IRI(DSV + "model");

const DSV_OBJECT_PROPERTY_PROFILE = IRI(DSV + "ObjectPropertyProfile");

const DSV_DATATYPE_PROPERTY_PROFILE = IRI(DSV + "DatatypePropertyProfile");

const DSV_HAS_PROPERTY = IRI(DSV + "property");

const DSV_RANGE_CLASS = IRI(DSV + "objectPropertyRange");

const DSV_RANGE_DATATYPE = IRI(DSV + "datatypePropertyRange");

const OWL = "http://www.w3.org/2002/07/owl#";

const OWL_ONTOLOGY = IRI(OWL + "Ontology");

const OWL_DATA_TYPE_PROPERTY = IRI(OWL + "DataTypeProperty");

const OWL_OBJECT_PROPERTY = IRI(OWL + "ObjectProperty");

const SKOS = "http://www.w3.org/2004/02/skos/core#";

const PREF_LABEL = IRI(SKOS + "prefLabel");

const VANN = "http://purl.org/vocab/vann/";

const USAGE_NOTE = IRI(VANN + "usageNote");

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
  specifications: DataSpecification[],
  configuration: RdfAdapterConfiguration | null = null
): Promise<string> {
  if (configuration == null) {
    configuration = defaultConfiguration();
  }
  const n3Writer = new N3.Writer({ prefixes: configuration.prefixes });
  const writer = new SpecificationWriter(n3Writer);
  for (const specification of specifications) {
    writer.writeDataSpecification(specification);
  }
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
      "owl": OWL,
      "skos": SKOS,
    },
  };
}

class SpecificationWriter {
  private writer: N3.Writer;

  constructor(writer: N3.Writer) {
    this.writer = writer;
  }

  writeDataSpecification(specification: DataSpecification) {
    this.addType(specification.iri, DCT_STANDARD);
    // TODO previousVersionIri
    // TODO reUsedSpecificationIri
    // TODO controlledVocabulary
    // TODO dataStructure
    // TODO artefact

    // For now we do not export vocabularies directly, but
    // only as a part of a profile.
    if (isApplicationProfile(specification)) {
      if (isVocabulary(specification)) {
        this.writeVocabulary(specification);
      }
      this.writeApplicationProfile(specification);
    }
  }

  addType(subject: string, type: N3.NamedNode) {
    this.writer.addQuad(IRI(subject), RDF_HAS_TYPE, type);
  }

  addIri(subject: string, predicate: N3.NamedNode, value: string | null) {
    if (value === null) {
      return;
    }
    this.writer.addQuad(IRI(subject), predicate, IRI(value));
  }

  addString(subject: string, predicate: N3.NamedNode, string: LanguageString | null) {
    if (string === null) {
      return;
    }
    for (const [lang, value] of Object.entries(string)) {
      this.writer.addQuad(IRI(subject), predicate, Literal(value, lang));
    }
  }

  writeVocabulary(vocabulary: Vocabulary) {
    this.addType(vocabulary.iri, OWL_ONTOLOGY);
    // Properties
    for (const property of vocabulary.properties) {
      this.addType(property.iri, RDF_PROPERTY);
      this.addIri(property.iri, RDFS_IS_DEFINED_BY, vocabulary.iri);
      
      if (isConceptualAttribute(property)) {
        this.writeConceptualAttribute(property);
      }
      if (isConceptualRelationship(property)) {
        this.writeConceptualRelationship(property);
      }
    }
    // CLasses
    for (const item of vocabulary.classes) {
      this.addIri(item.iri, RDFS_IS_DEFINED_BY, vocabulary.iri);

      this.writeConceptualClass(item);
    }
  }

  writeConceptualAttribute(concept: ConceptualAttribute) {
    this.addType(concept.iri, OWL_DATA_TYPE_PROPERTY);
  }
  writeConceptualRelationship(concept: ConceptualRelationship) {
    this.addType(concept.iri, OWL_OBJECT_PROPERTY);
    this.addString(concept.iri, RDFS_LABEL, concept.label);
    this.addIri(concept.iri, RDFS_DOMAIN, concept.domainIri);
    this.addIri(concept.iri, RDFS_RANGE, concept.rangeIri);
  }

  writeConceptualClass(concept: ConceptualClass) {
    this.addType(concept.iri, RDFS_CLASS);
  }  

  writeApplicationProfile(profile: ApplicationProfile) {
    this.addType(profile.iri, PROF_PROFILE);
    for (const iri of profile.applicationProfileOfIri) {
      this.addIri(profile.iri, PROF_IS_PROFILE_OF, iri);
    }
    const model = profile.model;
    this.addIri(profile.iri, DSV_HAS_CONCEPTUAL_MODEL, model.iri);
    this.writeConceptualModel(model)
  }

  writeConceptualModel(model: ConceptualModel) {
    this.addType(model.iri, DSV_CONCEPTUAL_MODEL);
    for (const profile of model.profiles) {
      this.addIri(profile.iri, DCT_IS_PART_OF, model.iri);
      this.addString(profile.iri, PREF_LABEL, profile.prefLabel);
      this.addString(profile.iri, USAGE_NOTE, profile.usageNote);
      // TODO defaultTechnicalLabel
      // TODO profileOfIri
      // TODO specializesProfileIri
      
      if (isClassProfile(profile)) {
        this.writeClassProfile(profile);
      }
      if (isObjectPropertyProfile(profile)) {
        this.writeObjectPropertyProfile(profile);
      }
      if (isDatatypePropertyProfile(profile)) {
        this.writeDatatypePropertyProfile(profile);
      }
    }
  }

  writeClassProfile(profile: ClassProfile) {
    this.addType(profile.iri, DSV_CLASS_PROFILE);
    this.addIri(profile.iri, DSV_HAS_CLASS, profile.profiledClassIri);

    for (const property of profile.properties) {
      if (isObjectPropertyProfile(property)) {
        this.writeObjectPropertyProfile(property);
      }
      if (isDatatypePropertyProfile(property)) {
        this.writeDatatypePropertyProfile(property);
      }      
    }
  }

  writeObjectPropertyProfile(profile: ObjectPropertyProfile) {
    this.addType(profile.iri, DSV_OBJECT_PROPERTY_PROFILE);
    this.addIri(profile.iri, DSV_HAS_PROPERTY, profile.profiledPropertyIri);
    // TODO requiredVocabulary
    // TODO additionalVocabulary

    for (const iri of profile.rangeClassIri) {
      this.addIri(profile.iri, DSV_RANGE_CLASS, iri);
    }
  }

  writeDatatypePropertyProfile(profile: DatatypePropertyProfile) {
    this.addType(profile.iri, DSV_DATATYPE_PROPERTY_PROFILE);
    this.addIri(profile.iri, DSV_HAS_PROPERTY, profile.profiledPropertyIri);
    // TODO requiredVocabulary
    // TODO additionalVocabulary
    
    for (const iri of profile.rangeDataTypeIri) {
      this.addIri(profile.iri, DSV_RANGE_DATATYPE, iri);
    }    
  }


}




