import {loadSchemaFromEntities} from "../schema-model-adapter";
import {FormalOpenSpecification, FosPropertyType} from "./fos-model";
import {schemaAsFormalOpenSpecification} from "./fos-model-adapter";
import {FederatedSource} from "../../rdf/statement/federated-source";
import {JsonldSource} from "../../rdf/statement/jsonld-source";
import {loadFromIri} from "../../platform-model/platform-model-adapter";

test("Convert 'věc' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/věc");
  const actual = schemaAsFormalOpenSpecification(input);
  const expected: FormalOpenSpecification = {
    "metadata": {
      "title": "Datová struktura pro reprezentaci věcí",
    },
    "overview": {},
    "specification": {
      "entities": [
        {
          "humanLabel": "Věc",
          "humanDescription": "",
          "properties": [
            {
              "propertyType": FosPropertyType.Attribute,
              "technicalLabel": "název",
              "typeLabel": "Text",
              "typeValue":
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
              "humanLabel": "Název",
              "description": "Název věci.",
              "examples": []
            },
            {
              "propertyType": FosPropertyType.Attribute,
              "technicalLabel": "popis",
              "typeLabel": "Text",
              "typeValue":
                "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
              "humanLabel": "Popis",
              "description": "Textový popis věci.",
              "examples": []
            },
            {
              "propertyType": FosPropertyType.Association,
              "technicalLabel": "vytvořeno",
              "typeLabel": "Datová struktura pro reprezentaci časového okamžiku",
              "typeValue":
                "https://ofn.gov.cz/základní-datové-typy/2020-07-01/#časový-okamžik",
              "humanLabel": "Vytvořeno",
              "description": "Datum a čas zveřejnění věci.",
              "examples": []
            },
            {
              "propertyType": FosPropertyType.Association,
              "technicalLabel": "aktualizováno",
              "typeLabel": "Datová struktura pro reprezentaci časového okamžiku",
              "typeValue":
                "https://ofn.gov.cz/základní-datové-typy/2020-07-01/#časový-okamžik",
              "humanLabel": "Aktualizováno",
              "description": "Časový okamžik poslední aktualizace údajů.",
              "examples": []
            },
            {
              "propertyType": FosPropertyType.Association,
              "technicalLabel": "relevantní_do",
              "typeLabel": "Datová struktura pro reprezentaci časového okamžiku",
              "typeValue":
                "https://ofn.gov.cz/základní-datové-typy/2020-07-01/#časový-okamžik",
              "humanLabel": "Relevantní do",
              "description": "Časový okamžik, ...",
              "examples": []
            },
            {
              "propertyType": FosPropertyType.Association,
              "technicalLabel": "zneplatněno",
              "typeLabel": "Datová struktura pro reprezentaci časového okamžiku",
              "typeValue":
                "https://ofn.gov.cz/základní-datové-typy/2020-07-01/#časový-okamžik",
              "humanLabel": "Zneplatněno",
              "description": "Časový okamžik,...",
              "examples": []
            },
            {
              "propertyType": FosPropertyType.Association,
              "technicalLabel": "příloha",
              "typeLabel": "Datová struktura pro reprezentaci digitálních objektů",
              "typeValue":
                "https://ofn.gov.cz/digitální-objekty/2020-07-01/#třída-příloha",
              "humanLabel": "Příloha",
              "description": "Dodatečné digitální objekty, ...",
              "examples": []
            }
          ]
        }
      ]
    },
    "examples": [],
    "references": {},
  };
  expect(actual).toEqual(expected);
});

async function loadFromTestSources(iri) {
  const source = FederatedSource.create([
    await JsonldSource.create("file://test/ofn-psm.ttl"),
    await JsonldSource.create("file://test/ofn-pim.ttl"),
    await JsonldSource.create("file://test/ofn-cim.ttl"),
  ]);
  const entities = {};
  const entity = await loadFromIri(source, entities, iri);
  return loadSchemaFromEntities(entities, entity.id);
}
