import {ReadOnlyMemoryStore} from "../../core/store/memory-store/read-only-memory-store";
import {createObjectModelFromCoreModel} from "./object-model-adapter";
import {CoreResource} from "../../core";

test("Load sample schema.", async () => {
  const input = {
    "local:schema": {
      "iri": "local:schema",
      "types": ["data-psm-schema"],
      "dataPsmRoots": ["local:Employee"],
      "dataPsmHumanLabel": {
        "cs": "Schéma",
        "en": "Schema",
      },
    } as CoreResource,
    "local:Person": {
      "iri": "local:Person",
      "types": ["data-psm-class"],
      "dataPsmTechnicalLabel": "person",
      "dataPsmExtends": [],
      "dataPsmParts": ["local:name"],
    } as CoreResource,
    "local:Employee": {
      "iri": "local:Employee",
      "types": ["data-psm-class"],
      "dataPsmTechnicalLabel": "employee",
      "dataPsmExtends": ["local:Person"],
      "dataPsmParts": ["local:salary", "local:worksFor"],
    } as CoreResource,
    "local:name": {
      "iri": "local:name",
      "types": ["data-psm-attribute"],
      "dataPsmTechnicalLabel": "name",
      "dataPsmDatatype": "xsd:string",
    } as CoreResource,
    "local:salary": {
      "iri": "local:salary",
      "types": ["data-psm-attribute"],
      "dataPsmTechnicalLabel": "salary",
      "dataPsmDatatype": "xsd:integer",
    } as CoreResource,
    "local:worksFor": {
      "iri": "local:worksFor",
      "types": ["data-psm-association-end"],
      "dataPsmInterpretation": "local:pim:workFor",
      "dataPsmPart": "local:Person",
    } as CoreResource,
    "local:pim:workFor": {
      "iri": "local:pim:workFor",
      "types": ["pim-association-end"],
      "pimInterpretation": "local:cim:workFor",
      "pimTechnicalLabel": "workFor",
      "pimHumanLabel": {
        "cs": "Pracuje pro",
        "en": "Work for",
      },
    } as CoreResource,
  };
  const expectedPerson = {
    "psmIri": "local:Person",
    "technicalLabel": "person",
    "type": "object-model-class",
    "extends": [],
    "properties": [{
      "psmIri": "local:name",
      "technicalLabel": "name",
      "dataTypes": [{
        "type": "primitive-data-type",
        "dataType": "xsd:string",
      }],
      "cardinality": {"min": 0},
    }],
    "isCodelist": false,
  };
  const expectedEmployee = {
    "psmIri": "local:Employee",
    "technicalLabel": "employee",
    "type": "object-model-class",
    "extends": [expectedPerson],
    "properties": [{
      "psmIri": "local:salary",
      "technicalLabel": "salary",
      "dataTypes": [{
        "type": "primitive-data-type",
        "dataType": "xsd:integer",
      }],
      "cardinality": {"min": 0},
    }, {
      "psmIri": "local:worksFor",
      "pimIri": "local:pim:workFor",
      "cimIri": "local:cim:workFor",
      "technicalLabel": "workFor",
      "humanLabel": {
        "cs": "Pracuje pro",
        "en": "Work for",
      },
      "dataTypes": [expectedPerson],
      "cardinality": {"min": 0},
    }],
    "isCodelist": false,
  };
  const expected = {
    "humanLabel": {
      "cs": "Schéma",
      "en": "Schema",
    },
    "psmIri": "local:schema",
    "roots": [expectedEmployee],
    "classes": [expectedEmployee, expectedPerson],
  };
  const actual = await createObjectModelFromCoreModel(
    new ReadOnlyMemoryStore(input), "local:schema");
  expect(actual).toEqual(expected);
});
