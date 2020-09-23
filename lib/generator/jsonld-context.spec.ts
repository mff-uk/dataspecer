import {FederatedSource} from "../rdf/statement/federated-source";
import {JsonldSource} from "../rdf/statement/jsonld-source";
import {loadFromIri} from "../platform-model/platform-model-adapter";
import {produceFlatJsonLdContext} from "./jsonld-context";

test("Generate věc.ssp context.", async () => {
  const source = FederatedSource.create([
    await JsonldSource.create("file://test/ofn-psm.ttl"),
    await JsonldSource.create("file://test/ofn-pim.ttl"),
    // await SparqlSource.create("https://slovník.gov.cz/sparql")
  ]);
  const entities = {};
  const entity = await loadFromIri(
    source, entities, "https://ofn.gov.cz/zdroj/psm/schéma/věc");

  const prefixes = {
    "adms": "http://www.w3.org/ns/adms#",
    "dcat": "http://www.w3.org/ns/dcat#",
    "dcatap": "http://data.europa.eu/r5r/",
    "dcterms": "http://purl.org/dc/terms/",
    "foaf": "http://xmlns.com/foaf/0.1/",
    "gr": "http://purl.org/goodrelations/v1#",
    "location": "http://www.w3.org/ns/locn#",
    "odrl": "http://www.w3.org/ns/odrl/2/",
    "prov": "http://www.w3.org/ns/prov#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "schema": "http://schema.org/",
    "skos": "http://www.w3.org/2004/02/skos/core#",
    "spdx": "http://spdx.org/rdf/terms#",
    "time": "http://www.w3.org/2006/time#",
    "vcard": "http://www.w3.org/2006/vcard/ns#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "věci": "https://slovník.gov.cz/generický/věci/pojem/",
  };

  const actual = produceFlatJsonLdContext(entities, entity, prefixes);

  const expected = {
    "@context": {
      "@version": 1.1,
      "adms": "http://www.w3.org/ns/adms#",
      "dcat": "http://www.w3.org/ns/dcat#",
      "dcatap": "http://data.europa.eu/r5r/",
      "dcterms": "http://purl.org/dc/terms/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "gr": "http://purl.org/goodrelations/v1#",
      "location": "http://www.w3.org/ns/locn#",
      "odrl": "http://www.w3.org/ns/odrl/2/",
      "prov": "http://www.w3.org/ns/prov#",
      "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "schema": "http://schema.org/",
      "skos": "http://www.w3.org/2004/02/skos/core#",
      "spdx": "http://spdx.org/rdf/terms#",
      "time": "http://www.w3.org/2006/time#",
      "vcard": "http://www.w3.org/2006/vcard/ns#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "věci": "https://slovník.gov.cz/generický/věci/pojem/",
      "iri": "@id",
      "typ": "@type",
      "název": {
        "@id": "věci:název",
        "@container": "@language"
      },
      "popis": {
        "@id": "věci:popis",
        "@container": "@language"
      },
      "vytvořeno": {
        "@id": "věci:vytvořeno",
        "@context": "https://ofn.gov.cz/základní-datové-typy/2020-07-01/kontexty/časový-okamžik.ssp.jsonld"
      },
      "aktualizováno": {
        "@id": "věci:aktualizováno",
        "@context": "https://ofn.gov.cz/základní-datové-typy/2020-07-01/kontexty/časový-okamžik.ssp.jsonld"
      },
      "relevantní_do": {
        "@id": "věci:relevantní-do",
        "@context": "https://ofn.gov.cz/základní-datové-typy/2020-07-01/kontexty/časový-okamžik.ssp.jsonld"
      },
      "zneplatněno": {
        "@id": "věci:zneplatněno",
        "@context": "https://ofn.gov.cz/základní-datové-typy/2020-07-01/kontexty/časový-okamžik.ssp.jsonld"
      },
      "příloha": {
        "@id": "věci:má-přílohu",
        "@context": "https://ofn.gov.cz/digitální-objekty/2020-07-01/kontexty/digitální-objekt.ssp.jsonld"
      }
    }
  };

  // console.log("ROOT:\n", entity);
  // console.log("ENTITIES:\n", entities);

  expect(actual).toEqual(expected);

});
