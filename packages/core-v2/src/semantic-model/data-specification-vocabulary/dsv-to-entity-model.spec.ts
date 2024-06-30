import { SemanticModelEntity, SemanticModelRelationship } from "../concepts";
import { ConceptualModel } from "./dsv-model";
import { conceptualModelToEntityListContainer } from "./dsv-to-entity-model";
import { entityListContainerToConceptualModel, createContext } from "./entity-model-to-dsv";

test("From DSV to entity model and back.", async () => {

  const dsv = {
    "iri": "http://dcat-ap-cz/model",
    "profiles": [
      {
        "iri": "https://dcat-ap/#Dataset",
        "prefLabel": null,
        "usageNote": {},
        "profileOfIri": null,
        "$type": [
          "class-profile"
        ],
        "profiledClassIri": "http://www.w3.org/ns/dcat#Dataset",
        "properties": [
          {
            "iri": "http://www.w3.org/ns/dcat#distribution-profile",
            "cardinality": "0-n",
            "prefLabel": null,
            "usageNote": {},
            "profileOfIri": null,
            "profiledPropertyIri": "http://www.w3.org/ns/dcat#distribution",
            "$type": ["object-property-profile"],
            "rangeClassIri": [
              "http://dcat-ap/ns/dcat#Distribution"
            ]
          }
        ]
      },
      {
        "iri": "https://dcat-ap-cz/#Dataset",
        "prefLabel": null,
        "usageNote": {},
        "profileOfIri": "https://dcat-ap/#Dataset",
        "$type": [
          "class-profile"
        ],
        "profiledClassIri": null,
        "properties": []
      },
      {
        "iri": "http://dcat-ap/ns/dcat#Distribution",
        "prefLabel": null,
        "usageNote": {},
        "profileOfIri": null,
        "$type": [
          "class-profile"
        ],
        "profiledClassIri": "http://www.w3.org/ns/dcat#Distribution",
        "properties": []
      }
    ]
  } as ConceptualModel;

  const iriToidentifier: Record<string, string> = {
    "https://dcat-ap/#Dataset": "dcat-ap-0001",
    "https://dcat-ap-cz/#Dataset": "dcat-ap-0002",
    "http://dcat-ap/ns/dcat#Distribution": "dcat-ap-0003",
    "http://www.w3.org/ns/dcat#distribution-profile": "dcat-ap-0005",
  };

  // Convert from DSV ConceptaulModel to EntityListContainer with Entities.
  const entityListContainer = conceptualModelToEntityListContainer(dsv, {
    iriToidentifier: iri => iriToidentifier[iri] ?? `MISSING ${iri}`,
  });

  const expectedEntityListContainer = {
    "baseIri": null,
    "entities": [
      {
        "id": "dcat-ap-0001",
        "usageOf": "http://www.w3.org/ns/dcat#Dataset",
        "type": [
          "class-usage"
        ],
        "iri": "https://dcat-ap/#Dataset",
        "name": null,
        "description": null,
        "usageNote": {}
      },
      {
        "usageNote": {},
        "id": "dcat-ap-0005",
        "type": [
          "relationship-usage"
        ],
        "iri": null,
        "usageOf": "http://www.w3.org/ns/dcat#distribution",
        "name": null,
        "description": null,
        "ends": [
          {
            "name": null,
            "description": null,
            "cardinality": null,
            "concept": "dcat-ap-0001",
            "usageNote": null,
            "iri": null
          },
          {
            "name": null,
            "description": null,
            "cardinality": [
              0,
              null
            ],
            "concept": "dcat-ap-0003",
            "usageNote": {},
            "iri": "http://www.w3.org/ns/dcat#distribution-profile"
          }
        ]
      },
      {
        "id": "dcat-ap-0002",
        "usageOf": "dcat-ap-0001",
        "type": [
          "class-usage"
        ],
        "iri": "https://dcat-ap-cz/#Dataset",
        "name": null,
        "description": null,
        "usageNote": {}
      },
      {
        "id": "dcat-ap-0003",
        "usageOf": "http://www.w3.org/ns/dcat#Distribution",
        "type": [
          "class-usage"
        ],
        "iri": "http://dcat-ap/ns/dcat#Distribution",
        "name": null,
        "description": null,
        "usageNote": {}
      },
    ]
  }

  expect(entityListContainer).toStrictEqual(expectedEntityListContainer);

  // We need to add placeholder for a vocabulary, so we can properly
  // detect profiles or classes/relationships (from vocabulary) as
  // we need it to export to DSV properly. The reason is that DSV
  // utilize different predicate to profile profile or something
  // from a vocabulary.
  const vocabularyEntities: SemanticModelEntity[] = [{
    "id": "http://www.w3.org/ns/dcat#Dataset",
    "iri": "http://www.w3.org/ns/dcat#Dataset",
    "type": [
      "class"
    ],
  }, {
    "id": "http://www.w3.org/ns/dcat#Distribution",
    "iri": "http://www.w3.org/ns/dcat#Distribution",
    "type": [
      "class"
    ],
  }, {
    "id": "http://www.w3.org/ns/dcat#distribution",
    "iri": "http://www.w3.org/ns/dcat#distribution",
    "name": {},
    "description": {},
    "type": [
      "relationship"
    ],
    "ends": [{
      "iri": null,
      "concept": null,
    }, {
      "iri": null,
      "concept": null,
    }],
  } as SemanticModelRelationship];

  // Convert from EntityListContainer with entities to ConceptaulModel.
  const context = createContext([entityListContainer, {
    baseIri: null,
    entities: vocabularyEntities,
  }], value => value ?? null);
  const actual = entityListContainerToConceptualModel("http://dcat-ap-cz/model", entityListContainer, context)
  expect(actual).toStrictEqual(dsv);
});

