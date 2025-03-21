import { SemanticModelRelationshipProfile } from "../profile/concepts";
import { Cardinality, ConceptualModel, DatatypePropertyProfile, ObjectPropertyProfile } from "./dsv-model";
import { conceptualModelToEntityListContainer } from "./dsv-to-entity-model";
import { conceptualModelToRdf } from "./dsv-to-rdf";
import { EntityListContainer } from "./entity-model";
import { createContext, entityListContainerToConceptualModel } from "./entity-model-to-dsv";
import { rdfToConceptualModel } from "./rdf-to-dsv";

test("End to end test I.", async () => {

  const container = {
    "baseIri": "http://dcat/model/",
    "entities": [{
      "id": "lqo2gocgg4sm7d1ivqx",
      "iri": "flatBack",
      "type": ["class"],
      "name": { "en": "Flat Back" },
      "description": {}
    }, {
      "id": "xg0kzal0g2m7d1ix6t",
      "iri": "http://localhost/sweetState",
      "type": ["class"],
      "name": { "en": "Sweet State" },
      "description": {}
    }, {
      "id": "u42wg5rcg2im7d1j3hm",
      "type": ["relationship"],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [{
        "name": {},
        "description": {},
        "cardinality": null,
        "concept": "xg0kzal0g2m7d1ix6t",
        "iri": null
      }, {
        "name": { "en": "Drab Moment" },
        "description": {},
        "cardinality": null,
        "concept": "lqo2gocgg4sm7d1ivqx",
        "iri": "drabMoment"
      }]
    }, {
      "id": "ml7qgk4tl6sm7d1j6lj",
      "type": ["relationship"],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [{
        "name": {},
        "description": {},
        "concept": "lqo2gocgg4sm7d1ivqx",
        "iri": null
      }, {
        "name": { "en": "Energetic Problem" },
        "description": {},
        "concept": "http://www.w3.org/2000/01/rdf-schema#Literal",
        "iri": "energeticProblem"
      }]
    }, {
      "id": "rz94ir172eqm7d1j8i2",
      "type": ["relationship"],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [{
        "name": {},
        "description": {},
        "concept": "xg0kzal0g2m7d1ix6t",
        "iri": null
      }, {
        "name": { "en": "Tight Art" },
        "description": {},
        "concept": "http://www.w3.org/2000/01/rdf-schema#Literal",
        "iri": "tightArt"
      }]
    }, {
      "id": "wa1svaft06dm7d1jcd8",
      "iri": "upsetProgram",
      "type": ["class"],
      "name": { "en": "Upset Program" },
      "description": {}
    }, {
      "id": "s4gk5aa3z48m7d1jgjh",
      "iri": null,
      "child": "lqo2gocgg4sm7d1ivqx",
      "parent": "wa1svaft06dm7d1jcd8",
      "type": ["generalization"]
    }, {
      "iri": "sweetState1",
      "profiling": ["xg0kzal0g2m7d1ix6t"],
      "name": { "en": "Sweet State" },
      "nameFromProfiled": "xg0kzal0g2m7d1ix6t",
      "description": {},
      "descriptionFromProfiled": "xg0kzal0g2m7d1ix6t",
      "usageNote": {},
      "usageNoteFromProfiled": null,
      "id": "hwey2q71bvjm7d1jrlq",
      "type": ["class-profile"]
    }, {
      "id": "94kn5yss8dm7d1jv9z",
      "type": ["class-profile"],
      "description": { "en": "Changed in profile" },
      "descriptionFromProfiled": null,
      "name": { "en": "Flat Back Changed in Profile" },
      "nameFromProfiled": null,
      "iri": "flatBack1",
      "usageNote": { "en": "usage note" },
      "usageNoteFromProfiled": null,
      "profiling": ["lqo2gocgg4sm7d1ivqx"]
    }, {
      "ends": [{
        "name": null,
        "nameFromProfiled": null,
        "description": null,
        "descriptionFromProfiled": null,
        "iri": null,
        "cardinality": [0, null],
        "usageNote": null,
        "usageNoteFromProfiled": null,
        "profiling": [],
        "concept": "hwey2q71bvjm7d1jrlq"
      }, {
        "name": { "en": "Drab Moment" },
        "nameFromProfiled": "u42wg5rcg2im7d1j3hm",
        "description": {},
        "descriptionFromProfiled": "u42wg5rcg2im7d1j3hm",
        "iri": "SweetState.drabMoment",
        "cardinality": [0, null
        ],
        "usageNote": {},
        "usageNoteFromProfiled": null,
        "profiling": ["u42wg5rcg2im7d1j3hm"],
        "concept": "94kn5yss8dm7d1jv9z"
      }],
      "id": "fk532ihkfa5m7d1k90e",
      "type": ["relationship-profile"]
    } as SemanticModelRelationshipProfile, {
      "id": "f9tj2irq2gm7d1lcrj",
      "type": ["relationship"],
      "iri": null,
      "name": {},
      "description": {},
      "ends": [{
        "name": {},
        "description": {},
        "cardinality": null,
        "concept": "xg0kzal0g2m7d1ix6t",
        "iri": null
      }, {
        "name": { "en": "Extensive Face" },
        "description": {},
        "cardinality": null,
        "concept": "lqo2gocgg4sm7d1ivqx",
        "iri": "extensiveFace"
      }]
    }, {
      "ends": [{
        "name": null,
        "nameFromProfiled": null,
        "description": null,
        "descriptionFromProfiled": null,
        "iri": null,
        "cardinality": [0, null],
        "usageNote": null,
        "usageNoteFromProfiled": null,
        "profiling": [],
        "concept": "hwey2q71bvjm7d1jrlq"
      }, {
        "name": {},
        "nameFromProfiled": "rz94ir172eqm7d1j8i2",
        "description": {},
        "descriptionFromProfiled": "rz94ir172eqm7d1j8i2",
        "iri": "SweetState.tightArtChanges",
        "cardinality": [0, null],
        "usageNote": {},
        "usageNoteFromProfiled": null,
        "profiling": ["rz94ir172eqm7d1j8i2"],
        "concept": "http://www.w3.org/2000/01/rdf-schema#Literal"
      }],
      "id": "kss58ru9dom7d1omi4",
      "type": ["relationship-profile"]
    }]
  } as EntityListContainer;

  const context = createContext([container]);

  const conceptualModel = entityListContainerToConceptualModel(
    "http://dcat/model/", container, context);

  const expectedConceptualModel: ConceptualModel = {
    "iri": "http://dcat/model/",
    "profiles": [{
      "iri": "http://dcat/model/sweetState1",
      "prefLabel": {},
      "definition": {},
      "usageNote": {},
      "profileOfIri": [],
      "$type": ["class-profile"],
      "properties": [{
        "iri": "http://dcat/model/SweetState.drabMoment",
        "cardinality": Cardinality.ZeroToMany,
        "prefLabel": {},
        "definition": {},
        "usageNote": {},
        "profileOfIri": [],
        "profiledPropertyIri": ["http://dcat/model/drabMoment"],
        "reusesPropertyValue": [{
          "reusedPropertyIri": "http://www.w3.org/2004/02/skos/core#prefLabel",
          "propertyreusedFromResourceIri": "http://dcat/model/drabMoment"
        }, {
          "reusedPropertyIri": "http://www.w3.org/2004/02/skos/core#definition",
          "propertyreusedFromResourceIri": "http://dcat/model/drabMoment"
        }],
        "$type": ["object-property-profile"],
        "rangeClassIri": ["http://dcat/model/flatBack1"]
      } as ObjectPropertyProfile, {
        "iri": "http://dcat/model/SweetState.tightArtChanges",
        "cardinality": Cardinality.ZeroToMany,
        "prefLabel": {},
        "definition": {},
        "usageNote": {},
        "profileOfIri": [],
        "profiledPropertyIri": ["http://dcat/model/tightArt"],
        "reusesPropertyValue": [{
          "reusedPropertyIri": "http://www.w3.org/2004/02/skos/core#prefLabel",
          "propertyreusedFromResourceIri": "http://dcat/model/tightArt"
        }, {
          "reusedPropertyIri": "http://www.w3.org/2004/02/skos/core#definition",
          "propertyreusedFromResourceIri": "http://dcat/model/tightArt"
        }],
        "$type": ["datatype-property-profile"],
        "rangeDataTypeIri": ["http://www.w3.org/2000/01/rdf-schema#Literal"]
      } as DatatypePropertyProfile],
      "reusesPropertyValue": [{
        "reusedPropertyIri": "http://www.w3.org/2004/02/skos/core#prefLabel",
        "propertyreusedFromResourceIri": "http://localhost/sweetState"
      }, {
        "reusedPropertyIri": "http://www.w3.org/2004/02/skos/core#definition",
        "propertyreusedFromResourceIri": "http://localhost/sweetState"
      }],
      "profiledClassIri": ["http://localhost/sweetState"]
    }, {
      "iri": "http://dcat/model/flatBack1",
      "prefLabel": { "en": "Flat Back Changed in Profile" },
      "definition": { "en": "Changed in profile" },
      "usageNote": { "en": "usage note" },
      "profileOfIri": [],
      "$type": ["class-profile"],
      "properties": [],
      "reusesPropertyValue": [],
      "profiledClassIri": ["http://dcat/model/flatBack"]
    }],
  };

  expect(conceptualModel).toStrictEqual(expectedConceptualModel);

  // We go to RDF and back.
  const actualRdf = await conceptualModelToRdf(conceptualModel, {});
  const parsedConceptualModel = (await rdfToConceptualModel(actualRdf))[0]!;
  expect(parsedConceptualModel).toStrictEqual(conceptualModel);

  const iriToIdentifier: Record<string, string> = {
    "http://dcat/model/sweetState1": "hwey2q71bvjm7d1jrlq",
    "http://dcat/model/flatBack1": "94kn5yss8dm7d1jv9z",
    "http://dcat/model/SweetState.drabMoment": "fk532ihkfa5m7d1k90e",
    "http://dcat/model/SweetState.tightArtChanges": "kss58ru9dom7d1omi4",
    // Vocabulary
    "http://dcat/model/flatBack": "lqo2gocgg4sm7d1ivqx",
    "http://dcat/model/tightArt": "rz94ir172eqm7d1j8i2",
    "http://localhost/sweetState": "xg0kzal0g2m7d1ix6t",
    "http://dcat/model/drabMoment": "u42wg5rcg2im7d1j3hm",
    // Identity for test
    "http://www.w3.org/2000/01/rdf-schema#Literal": "http://www.w3.org/2000/01/rdf-schema#Literal",
  };

  const parsedContainer = conceptualModelToEntityListContainer(
    parsedConceptualModel, {
    iriToIdentifier: iri => iriToIdentifier[iri] ?? `MISSING ${iri}`,
    iriUpdate: iri => iri.replace("http://dcat/model/", ""),
  });

  // We can not use the original one as there are only profiles.
  const expectedContainer = {
    "baseIri": "", // We can not detect the base IRI yet.
    "entities": [{
      "iri": "sweetState1",
      "profiling": ["xg0kzal0g2m7d1ix6t"],
      "name": {},
      "nameFromProfiled": "xg0kzal0g2m7d1ix6t",
      "description": {},
      "descriptionFromProfiled": "xg0kzal0g2m7d1ix6t",
      "usageNote": {},
      "usageNoteFromProfiled": null,
      "id": "hwey2q71bvjm7d1jrlq",
      "type": ["class-profile"]
    }, {
      "ends": [{
        "name": {},
        "nameFromProfiled": null,
        "description": {},
        "descriptionFromProfiled": null,
        "iri": null,
        // DSV does not support cardinality for domain.
        "cardinality": null, // [0, null],
        "usageNote": {},
        "usageNoteFromProfiled": null,
        "profiling": [],
        "concept": "hwey2q71bvjm7d1jrlq"
      }, {
        "name": {},
        "nameFromProfiled": "u42wg5rcg2im7d1j3hm",
        "description": {},
        "descriptionFromProfiled": "u42wg5rcg2im7d1j3hm",
        "iri": "SweetState.drabMoment",
        "cardinality": [0, null],
        "usageNote": {},
        "usageNoteFromProfiled": null,
        "profiling": ["u42wg5rcg2im7d1j3hm"],
        "concept": "94kn5yss8dm7d1jv9z"
      }],
      "id": "fk532ihkfa5m7d1k90e",
      "type": ["relationship-profile"]
    }, {
      "ends": [{
        "name": {},
        "nameFromProfiled": null,
        "description": {},
        "descriptionFromProfiled": null,
        "iri": null,
        // DSV does not support cardinality for domain.
        "cardinality": null, // [0, null],
        "usageNote": {},
        "usageNoteFromProfiled": null,
        "profiling": [],
        "concept": "hwey2q71bvjm7d1jrlq"
      }, {
        "name": { },
        "nameFromProfiled": "rz94ir172eqm7d1j8i2",
        "description": {},
        "descriptionFromProfiled": "rz94ir172eqm7d1j8i2",
        "iri": "SweetState.tightArtChanges",
        "cardinality": [0, null],
        "usageNote": {},
        "usageNoteFromProfiled": null,
        "profiling": ["rz94ir172eqm7d1j8i2"],
        "concept": "http://www.w3.org/2000/01/rdf-schema#Literal"
      }],
      "id": "kss58ru9dom7d1omi4",
      "type": ["relationship-profile"]
    } as SemanticModelRelationshipProfile, {
      "id": "94kn5yss8dm7d1jv9z",
      "type": ["class-profile"],
      "description": { "en": "Changed in profile" },
      "descriptionFromProfiled": null,
      "name": { "en": "Flat Back Changed in Profile" },
      "nameFromProfiled": null,
      "iri": "flatBack1",
      "usageNote": { "en": "usage note" },
      "usageNoteFromProfiled": null,
      "profiling": ["lqo2gocgg4sm7d1ivqx"]
    }],
  } as EntityListContainer;

  expect(parsedContainer).toStrictEqual(expectedContainer);

});
