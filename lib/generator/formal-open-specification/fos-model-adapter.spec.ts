import {existsSync, mkdirSync, writeFileSync} from "fs";

import {loadSchemaFromEntities} from "../schema-model-adapter";
import {schemaAsFormalOpenSpecification} from "./fos-model-adapter";
import {FederatedSource} from "../../rdf/statements/federated-source";
import {JsonldSource} from "../../rdf/statements/jsonld-source";
import {loadFromIri} from "../../platform-model/platform-model-adapter";
import {writeFosToDirectory} from "./fos-writer";

test("Convert 'časový-okamžik' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/časový-okamžik");
  const actual = schemaAsFormalOpenSpecification(input);
  writeJson(actual, "./test-output/formal-open-specification", "časový-okamžik");
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

async function writeJson(content: any, dir: string, name: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
  const path = dir + "/" + name;
  writeFileSync(path + ".json", JSON.stringify(content, null, 2));
  writeFosToDirectory(content, path);
}

test("Convert 'věc' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/věc");
  const actual = schemaAsFormalOpenSpecification(input);
  writeJson(actual, "./test-output/formal-open-specification", "věc");
});

test("Convert 'digitální-objekt' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/digitální-objekt");
  const actual = schemaAsFormalOpenSpecification(input);
  writeJson(actual, "./test-output/formal-open-specification", "digitální-objekt");
});

test("Convert 'kontakt' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/kontakt");
  const actual = schemaAsFormalOpenSpecification(input);
  writeJson(actual, "./test-output/formal-open-specification", "kontakt");
});

test("Convert 'člověk' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/člověk");
  const actual = schemaAsFormalOpenSpecification(input);
  writeJson(actual, "./test-output/formal-open-specification", "člověk");
});

test("Convert 'věc' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/věc");
  const actual = schemaAsFormalOpenSpecification(input);
  writeJson(actual, "./test-output/formal-open-specification", "věc");
});

test("Convert 'osoba' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/osoba");
  const actual = schemaAsFormalOpenSpecification(input);
  writeJson(actual, "./test-output/formal-open-specification", "osoba");
});

test("Convert 'místo' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/místo");
  const actual = schemaAsFormalOpenSpecification(input);
  writeJson(actual, "./test-output/formal-open-specification", "místo");
});

test("Convert 'turistický-cíl' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/turistický-cíl");
  const actual = schemaAsFormalOpenSpecification(input);
  writeJson(actual, "./test-output/formal-open-specification", "turistický-cíl");
});

test("Convert 'veřejné-místo' to formal open specification.", async () => {
  const input = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/veřejné-místo");
  const actual = schemaAsFormalOpenSpecification(input);
  writeJson(actual, "./test-output/formal-open-specification", "veřejné-místo");
});
