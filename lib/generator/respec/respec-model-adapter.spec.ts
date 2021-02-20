import {existsSync, mkdirSync, writeFileSync} from "fs";

import {loadSchemaFromEntities} from "../schema-model-adapter";
import {schemaAsReSpec} from "./respec-model-adapter";
import {FederatedSource} from "../../rdf/statements/federated-source";
import {JsonldSource} from "../../rdf/statements/jsonld-source";
import {loadFromIri} from "../../platform-model/platform-model-adapter";
import {writeReSpecToDirectory} from "./respec-writer";

// test("Convert 'časový-okamžik' to respec.", async () => {
//   const input = await loadFromTestSourcesGroupOne(
//     "https://ofn.gov.cz/zdroj/psm/schéma/časový-okamžik");
//   const actual = schemaAsReSpec(input);
//   writeJson(actual, "./test-output/respec", "časový-okamžik");
// });

async function loadFromTestSourcesGroupOne(iri) {
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
    mkdirSync(dir, {"recursive": true});
  }
  const path = dir + "/" + name;
  writeFileSync(path + ".json", JSON.stringify(content, null, 2));
  writeReSpecToDirectory(content, path);
}

// test("Convert 'věc' to respec.", async () => {
//   const input = await loadFromTestSourcesGroupOne(
//     "https://ofn.gov.cz/zdroj/psm/schéma/věc");
//   const actual = schemaAsReSpec(input);
//   writeJson(actual, "./test-output/respec", "věc");
// });

// test("Convert 'digitální-objekt' to respec.", async () => {
//   const input = await loadFromTestSourcesGroupOne(
//     "https://ofn.gov.cz/zdroj/psm/schéma/digitální-objekt");
//   const actual = schemaAsReSpec(input);
//   writeJson(actual, "./test-output/respec", "digitální-objekt");
// });

// test("Convert 'kontakt' to respec.", async () => {
//   const input = await loadFromTestSourcesGroupOne(
//     "https://ofn.gov.cz/zdroj/psm/schéma/kontakt");
//   const actual = schemaAsReSpec(input);
//   writeJson(actual, "./test-output/respec", "kontakt");
// });

// test("Convert 'člověk' to respec.", async () => {
//   const input = await loadFromTestSourcesGroupOne(
//     "https://ofn.gov.cz/zdroj/psm/schéma/člověk");
//   const actual = schemaAsReSpec(input);
//   writeJson(actual, "./test-output/respec", "člověk");
// });

// test("Convert 'věc' to respec.", async () => {
//   const input = await loadFromTestSourcesGroupOne(
//     "https://ofn.gov.cz/zdroj/psm/schéma/věc");
//   const actual = schemaAsReSpec(input);
//   writeJson(actual, "./test-output/respec", "věc");
// });

// test("Convert 'osoba' to respec.", async () => {
//   const input = await loadFromTestSourcesGroupOne(
//     "https://ofn.gov.cz/zdroj/psm/schéma/osoba");
//   const actual = schemaAsReSpec(input);
//   writeJson(actual, "./test-output/respec", "osoba");
// });

// test("Convert 'místo' to respec.", async () => {
//   const input = await loadFromTestSourcesGroupOne(
//     "https://ofn.gov.cz/zdroj/psm/schéma/místo");
//   const actual = schemaAsReSpec(input);
//   writeJson(actual, "./test-output/respec", "místo");
// });

// test("Convert 'turistický-cíl' to respec.", async () => {
//   const input = await loadFromTestSourcesGroupOne(
//     "https://ofn.gov.cz/zdroj/psm/schéma/turistický-cíl");
//   const actual = schemaAsReSpec(input);
//   writeJson(actual, "./test-output/respec", "turistický-cíl");
// });

// test("Convert 'veřejné-místo' to respec.", async () => {
//   const input = await loadFromTestSourcesGroupOne(
//     "https://ofn.gov.cz/zdroj/psm/schéma/veřejné-místo");
//   const actual = schemaAsReSpec(input);
//   writeJson(actual, "./test-output/respec", "veřejné-místo");
// });

test("Convert 'číselníky' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/ofn/číselníky");
  const actual = schemaAsReSpec(input);
  writeJson(actual, "./test-output/respec", "číselníky");
});

async function loadFromTestSourcesGroupTwo(iri) {
  const source = FederatedSource.create([
    await JsonldSource.create("file://test/pim-ofn-číselníky.ttl"),
    await JsonldSource.create("file://test/pim-rpp-adresní-místa.ttl"),
    await JsonldSource.create("file://test/pim-rpp-datové-schránky.ttl"),
    await JsonldSource.create("file://test/pim-rpp-orgány-veřejné-moci.ttl"),
    await JsonldSource.create("file://test/pim-rpp-osoby-právní-forma.ttl"),
    await JsonldSource.create("file://test/pim-rpp-pracoviště.ttl"),
    await JsonldSource.create("file://test/pim-rpp-ustanovení-právních-předpisů.ttl"),
    await JsonldSource.create("file://test/pim-rpp-zařazení-do-kategorií.ttl"),
    await JsonldSource.create("file://test/pim-ustanovení-právních-předpisů.ttl"),
    await JsonldSource.create("file://test/psm-ofn-číselníky.ttl"),
    await JsonldSource.create("file://test/psm-rpp-adresní-místa.ttl"),
    await JsonldSource.create("file://test/psm-rpp-datové-schránky.ttl"),
    await JsonldSource.create("file://test/psm-rpp-orgány-veřejné-moci.ttl"),
    await JsonldSource.create("file://test/psm-rpp-osoby-právní-forma.ttl"),
    await JsonldSource.create("file://test/psm-rpp-pracoviště.ttl"),
    await JsonldSource.create("file://test/psm-rpp-ustanovení-právních-předpisů.ttl"),
    await JsonldSource.create("file://test/psm-rpp-zařazení-do-kategorií.ttl"),
    await JsonldSource.create("file://test/pim-ustanovení-právních-předpisů.ttl"),
  ]);
  const entities = {};
  const entity = await loadFromIri(source, entities, iri);
  return loadSchemaFromEntities(entities, entity.id);
}

test("Convert 'adresní-místa' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/adresní-místa");
  const actual = schemaAsReSpec(input);
  writeJson(actual, "./test-output/respec", "adresní-místa");
});

test("Convert 'datové-schránky' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/datové-schránky");
  const actual = schemaAsReSpec(input);
  writeJson(actual, "./test-output/respec", "datové-schránky");
});

test("Convert 'orgány-veřejné-moci' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/orgány-veřejné-moci");
  const actual = schemaAsReSpec(input);
  writeJson(actual, "./test-output/respec", "orgány-veřejné-moci");
});

test("Convert 'osoby-právní-forma' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/osoby-právní-forma");
  const actual = schemaAsReSpec(input);
  writeJson(actual, "./test-output/respec", "osoby-právní-forma");
});

test("Convert 'pracoviště' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/pracoviště");
  const actual = schemaAsReSpec(input);
  writeJson(actual, "./test-output/respec", "pracoviště");
});

test("Convert 'ustanovení-právních-předpisů' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/ustanovení-právních-předpisů");
  const actual = schemaAsReSpec(input);
  writeJson(actual, "./test-output/respec", "ustanovení-právních-předpisů");
});

test("Convert 'zařazení-do-kategorií'' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/zařazení-do-kategorií");
  const actual = schemaAsReSpec(input);
  writeJson(actual, "./test-output/respec", "zařazení-do-kategorií'");
});
