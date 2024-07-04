import { createContext, entityListContainerToConceptualModel } from "./entity-model-to-dsv";

test("Issue #608", () => {

    const containers = [{
        "baseIri": "http://example/profil",
        "entities": [
            // Profile
            {
                "id": "hslnicx7yaely6tdyht",
                "usageOf": "http://www.w3.org/ns/Dataset",
                "type": [
                    "class-usage"
                ],
                "iri": "http://www.w3.org/ns/Dataset-profile",
                "name": null,
                "description": null,
                "usageNote": {}
            },
            {
                "usageNote": {},
                "id": "3sww3fqegbxly6tk8z3",
                "type": [
                    "relationship-usage"
                ],
                "iri": null,
                "usageOf": "http://purl.org/dc/terms/title#attribute",
                "name": null,
                "description": null,
                "ends": [
                    {
                        "name": null,
                        "description": null,
                        "cardinality": null,
                        "concept": "hslnicx7yaely6tdyht",
                        "usageNote": null,
                        "iri": null
                    },
                    {
                        "name": {
                            "en": "Dataset title"
                        },
                        "description": {
                            "en": "A name given to the dataset."
                        },
                        "cardinality": null,
                        "concept": "http://www.w3.org/2000/01/rdf-schema#Literal",
                        "usageNote": null,
                        "iri": "terms-title-profile"
                    }
                ]
            },
            // Vocabulary
            {
                "id": "http://www.w3.org/ns/Dataset",
                "iri": "http://www.w3.org/ns/Dataset",
                "name": {
                    "cs": "Datová sada",
                    "en": "Dataset"
                },
                "description": {
                    "cs": "Kolekce dat, ke stažení.",
                    "en": "A collection of data, published or curated by a single agent, and available for access or download in one or more representations."
                },
                "type": [
                    "class"
                ]
            },
            {
                "id": "http://purl.org/dc/terms/title#attribute",
                "iri": null,
                "type": [
                    "relationship"
                ],
                "name": {},
                "description": {},
                "ends": [
                    {
                        "cardinality": [
                            0,
                            null
                        ],
                        "name": {},
                        "description": {},
                        "concept": "http://www.w3.org/2002/07/owl#Thing"
                    },
                    {
                        "cardinality": [
                            0,
                            null
                        ],
                        "name": {
                            "en": "Title"
                        },
                        "description": {
                            "en": "A name given to the resource."
                        },
                        "concept": null,
                        "iri": "http://purl.org/dc/terms/title"
                    }
                ]
            },
        ]
    }] as any;

    const context = createContext(containers, value => {
        if (value === undefined || value === null) {
            return null;
        }
        return value;
    });

    const actual = entityListContainerToConceptualModel("http://dcat/model", containers[0], context);

    const expected = {
        "iri": "http://dcat/model",
        "profiles": [
            {
                "iri": "http://www.w3.org/ns/Dataset-profile",
                "prefLabel": null,
                "usageNote": {},
                "profileOfIri": null,
                "$type": [
                    "class-profile"
                ],
                "profiledClassIri": "http://www.w3.org/ns/Dataset",
                "properties": [
                    {
                        "iri": "http://example/profilterms-title-profile",
                        "cardinality": null,
                        "prefLabel": {
                            "en": "Dataset title"
                        },
                        "usageNote": null,
                        "profileOfIri": null,
                        "profiledPropertyIri": "http://purl.org/dc/terms/title#attribute",
                        "$type": [
                            "datatype-property-profile"
                        ],
                        "rangeDataTypeIri": [
                            "http://www.w3.org/2000/01/rdf-schema#Literal"
                        ]
                    }
                ]
            }
        ]
    }

    expect(actual).toStrictEqual(expected);
});
