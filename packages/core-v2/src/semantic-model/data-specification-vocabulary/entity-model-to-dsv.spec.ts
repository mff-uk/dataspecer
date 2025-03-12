import { ConceptualModel } from "./dsv-model";
import {
    createContext,
    entityListContainerToConceptualModel,
} from "./entity-model-to-dsv";

test("Issue #608", () => {

    const containers = [{
        "baseIri": "http://dcat/model/",
        "entities": [{
            "id": "hslnicx7yaely6tdyht",
            "usageOf": "http://www.w3.org/ns/Dataset",
            "type": ["class-usage"],
            "iri": "http://www.w3.org/ns/Dataset-profile",
            "name": null,
            "description": null,
            "usageNote": {},
        }, {
            "usageNote": {},
            "id": "3sww3fqegbxly6tk8z3",
            "type": ["relationship-usage"],
            "iri": null,
            "usageOf": "http://purl.org/dc/terms/title",
            "name": null,
            "description": null,
            "ends": [{
                "name": null,
                "description": null,
                "cardinality": null,
                "concept": "hslnicx7yaely6tdyht",
                "usageNote": {},
                "iri": null,
            }, {
                "name": { "en": "Dataset title" },
                "description": { "en": "A name given to the dataset." },
                "cardinality": null,
                "concept": "http://www.w3.org/2000/01/rdf-schema#Literal",
                "usageNote": {},
                "iri": "terms-title-profile",
            }],
        }, {
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
            "type": ["class"],
        }, {
            "id": "http://purl.org/dc/terms/title",
            "iri": null,
            "type": ["relationship"],
            "name": {},
            "description": {},
            "ends": [{
                "cardinality": [0, null],
                "name": {},
                "description": {},
                "concept": "http://www.w3.org/2002/07/owl#Thing",
            }, {
                "cardinality": [0, null
                ],
                "name": { "en": "Title" },
                "description": { "en": "A name given to the resource." },
                "concept": null,
                "iri": "http://purl.org/dc/terms/title",
            }],
        }],
    }] as any;

    const context = createContext(containers);

    const actual = entityListContainerToConceptualModel(
        "http://dcat/model/", containers[0], context);

    const expected: ConceptualModel = {
        "iri": "http://dcat/model/",
        "profiles": [{
            "iri": "http://www.w3.org/ns/Dataset-profile",
            "prefLabel": {},
            "definition": {},
            "usageNote": {},
            "profileOfIri": [],
            "reusesPropertyValue": [{
                "reusedPropertyIri": "http://www.w3.org/2004/02/skos/core#prefLabel",
                "propertyreusedFromResourceIri": "http://www.w3.org/ns/Dataset",
            }, {
                "reusedPropertyIri": "http://www.w3.org/2004/02/skos/core#definition",
                "propertyreusedFromResourceIri": "http://www.w3.org/ns/Dataset",
            }],
            "$type": ["class-profile"],
            "profiledClassIri": ["http://www.w3.org/ns/Dataset"],
            "properties": [{
                "iri": "http://dcat/model/terms-title-profile",
                "cardinality": null,
                "prefLabel": { "en": "Dataset title" },
                "definition": { "en": "A name given to the dataset." },
                "usageNote": {},
                "profileOfIri": [],
                "profiledPropertyIri": ["http://purl.org/dc/terms/title"],
                "reusesPropertyValue": [],
                "$type": ["datatype-property-profile"],
                "rangeDataTypeIri": [
                    "http://www.w3.org/2000/01/rdf-schema#Literal"
                ],
            } as any],
        }],
    };

    expect(actual).toStrictEqual(expected);
});

test("Default test for profiles.", () => {

    const containers = [{
        "baseIri": "http://dcat/model/",
        "entities": [{
            "id": "hslnicx7yaely6tdyht",
            "profiling": ["http://www.w3.org/ns/Dataset"],
            "type": ["class-profile"],
            "iri": "http://www.w3.org/ns/Dataset-profile",
            "name": null,
            "nameFromProfiled": "http://www.w3.org/ns/Dataset",
            "description": {"": "ignore this"},
            "descriptionFromProfiled": "http://www.w3.org/ns/Dataset",
            "usageNote": {"": "..."},
            "usageNoteFromProfiled": null,
        }, {
            "id": "3sww3fqegbxly6tk8z3",
            "type": ["relationship-profile"],
            "ends": [{
                "name": null,
                "description": null,
                "cardinality": null,
                "concept": "hslnicx7yaely6tdyht",
                "usageNote": {},
                "iri": null,
            }, {
                "name": { "en": "Dataset title" },
                "nameFromProfiled": null,
                "description": { "en": "A name given to the dataset." },
                "descriptionFromProfiled": null,
                "usageNote": {},
                "usageNoteFromProfiled": null,
                "cardinality": null,
                "concept": "http://www.w3.org/2000/01/rdf-schema#Literal",
                "iri": "terms-title-profile",
                "profiling": ["http://purl.org/dc/terms/title"]
            }],
        }, {
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
            "type": ["class"],
        }, {
            "id": "http://purl.org/dc/terms/title",
            "iri": null,
            "type": ["relationship"],
            "name": {},
            "description": {},
            "ends": [{
                "cardinality": [0, null],
                "name": {},
                "description": {},
                "concept": "http://www.w3.org/2002/07/owl#Thing",
            }, {
                "cardinality": [0, null
                ],
                "name": { "en": "Title" },
                "description": { "en": "A name given to the resource." },
                "concept": null,
                "iri": "http://purl.org/dc/terms/title",
            }],
        }],
    }] as any;

    const context = createContext(containers);

    const actual = entityListContainerToConceptualModel(
        "http://dcat/model/", containers[0], context);

    const expected: ConceptualModel = {
        "iri": "http://dcat/model/",
        "profiles": [{
            "iri": "http://www.w3.org/ns/Dataset-profile",
            "prefLabel": {},
            "definition": {},
            "usageNote": {"": "..."},
            "profileOfIri": [],
            "reusesPropertyValue": [{
                "reusedPropertyIri": "http://www.w3.org/2004/02/skos/core#prefLabel",
                "propertyreusedFromResourceIri": "http://www.w3.org/ns/Dataset",
            }, {
                "reusedPropertyIri": "http://www.w3.org/2004/02/skos/core#definition",
                "propertyreusedFromResourceIri": "http://www.w3.org/ns/Dataset",
            }],
            "$type": ["class-profile"],
            "profiledClassIri": ["http://www.w3.org/ns/Dataset"],
            "properties": [{
                "iri": "http://dcat/model/terms-title-profile",
                "cardinality": null,
                "prefLabel": { "en": "Dataset title" },
                "definition": { "en": "A name given to the dataset." },
                "usageNote": {},
                "profileOfIri": [],
                "profiledPropertyIri": ["http://purl.org/dc/terms/title"],
                "reusesPropertyValue": [],
                "$type": ["datatype-property-profile"],
                "rangeDataTypeIri": [
                    "http://www.w3.org/2000/01/rdf-schema#Literal"
                ],
            } as any],
        }],
    };

    expect(actual).toStrictEqual(expected);
});
