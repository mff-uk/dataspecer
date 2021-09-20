import {ReadOnlyMemoryStore} from "../../core";
import {coreResourcesToObjectModel} from "./object-model-adapter";
import {CoreResource} from "../../core";

test("Load sample schema.", async () => {
  const input = {
    "local:schema": {
      "iri": "local:schema",
      "types": ["data-psm-schema"],
      "dataPsmHumanLabel": {
        "cs": "Schéma",
        "en": "Schema",
      },
      "dataPsmHumanDescription": null,
      "dataPsmTechnicalLabel": null,
      "dataPsmRoots": ["local:Employee"],
      "dataPsmParts": [],
    } as CoreResource,
    "local:Person": {
      "iri": "local:Person",
      "types": ["data-psm-class"],
      "dataPsmHumanLabel": null,
      "dataPsmHumanDescription": null,
      "dataPsmTechnicalLabel": "person",
      "dataPsmInterpretation": null,
      "dataPsmExtends": [],
      "dataPsmParts": ["local:name"],
    } as CoreResource,
    "local:Employee": {
      "iri": "local:Employee",
      "types": ["data-psm-class"],
      "dataPsmHumanLabel": null,
      "dataPsmHumanDescription": null,
      "dataPsmTechnicalLabel": "employee",
      "dataPsmInterpretation": null,
      "dataPsmExtends": ["local:Person"],
      "dataPsmParts": ["local:salary", "local:worksFor"],
    } as CoreResource,
    "local:name": {
      "iri": "local:name",
      "types": ["data-psm-attribute"],
      "dataPsmHumanLabel": null,
      "dataPsmHumanDescription": null,
      "dataPsmTechnicalLabel": "name",
      "dataPsmInterpretation": null,
      "dataPsmDatatype": "xsd:string",
    } as CoreResource,
    "local:salary": {
      "iri": "local:salary",
      "types": ["data-psm-attribute"],
      "dataPsmHumanLabel": null,
      "dataPsmHumanDescription": null,
      "dataPsmTechnicalLabel": "salary",
      "dataPsmInterpretation": null,
      "dataPsmDatatype": "xsd:integer",
    } as CoreResource,
    "local:worksFor": {
      "iri": "local:worksFor",
      "types": ["data-psm-association-end"],
      "dataPsmHumanLabel": null,
      "dataPsmHumanDescription": null,
      "dataPsmTechnicalLabel": "workFor",
      "dataPsmInterpretation": "local:pim:workFor",
      "dataPsmPart": "local:Person",
    } as CoreResource,
    "local:pim:workFor": {
      "iri": "local:pim:workFor",
      "types": ["pim-association-end"],
      "pimHumanLabel": {
        "cs": "Pracuje pro",
        "en": "Work for",
      },
      "pimHumanDescription": null,
      "pimTechnicalLabel": "workFor",
      "pimInterpretation": null,
    } as CoreResource,
    "local:pim:workFor-owner": {
      "iri": "local:pim:workFor-owner",
      "types": ["pim-association"],
      "pimHumanLabel": null,
      "pimHumanDescription": null,
      "pimTechnicalLabel": null,
      "pimInterpretation": null,
      "pimEnd": ["local:pim:workFor"],
    } as CoreResource,
  };
  const expectedPerson = {
    "cimIri": null,
    "pimIri": null,
    "psmIri": "local:Person",
    "technicalLabel": "person",
    "humanLabel": null,
    "humanDescription": null,
    "type": "object-model-class",
    "extends": [],
    "properties": [{
      "cimIri": null,
      "pimIri": null,
      "psmIri": "local:name",
      "technicalLabel": "name",
      "humanLabel": null,
      "humanDescription": null,
      "dataTypes": [{
        "psmIri": null,
        "pimIri": null,
        "cimIri": null,
        "type": "primitive-data-type",
        "dataType": "xsd:string",
        "technicalLabel": null,
        "humanDescription": null,
        "humanLabel": null,
      }],
      "cardinality": {"min": 0, "max": null},
    }],
    "isCodelist": false,
  };
  const expectedEmployee = {
    "cimIri": null,
    "pimIri": null,
    "psmIri": "local:Employee",
    "technicalLabel": "employee",
    "humanLabel": null,
    "humanDescription": null,
    "type": "object-model-class",
    "extends": [expectedPerson],
    "properties": [{
      "cimIri": null,
      "pimIri": null,
      "psmIri": "local:salary",
      "technicalLabel": "salary",
      "humanLabel": null,
      "humanDescription": null,
      "dataTypes": [{
        "psmIri": null,
        "pimIri": null,
        "cimIri": null,
        "type": "primitive-data-type",
        "dataType": "xsd:integer",
        "technicalLabel": null,
        "humanDescription": null,
        "humanLabel": null,
      }],
      "cardinality": {"min": 0, "max": null},
    }, {
      "psmIri": "local:worksFor",
      "pimIri": "local:pim:workFor",
      "cimIri": null,
      "technicalLabel": "workFor",
      "humanLabel": {
        "cs": "Pracuje pro",
        "en": "Work for",
      },
      "humanDescription": null,
      "dataTypes": [expectedPerson],
      "cardinality": {"min": 0, "max": null},
    }],
    "isCodelist": false,
  };
  const expected = {
    "humanLabel": {
      "cs": "Schéma",
      "en": "Schema",
    },
    "humanDescription": null,
    "psmIri": "local:schema",
    "roots": [expectedEmployee],
    "classes": [expectedEmployee, expectedPerson],
    "technicalLabel": null,
  };
  const actual = await coreResourcesToObjectModel(
    ReadOnlyMemoryStore.create(input), "local:schema");
  expect(actual).toEqual(expected);
});
