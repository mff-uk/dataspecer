import {existsSync, mkdirSync, writeFileSync} from "fs";

import {JsonldSource} from "../rdf/statements/jsonld-source";
import {FederatedSource} from "../rdf/statements/federated-source";
import {loadFromIri} from "./platform-model-adapter";
import {SparqlSource} from "../rdf/statements/sparql-source";

test("Load 'číselníky' model.", async () => {
  const [actual, entities] = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/ofn/číselníky");
  writeJson(entities, "./test-output/model", "číselníky.json");
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
    await SparqlSource.create("https://slovník.gov.cz/sparql")
  ]);
  const entities = {};
  const actual = await loadFromIri(source, entities, iri);
  return [actual, entities];
}

async function writeJson(content: any, dir: string, fileName: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, {"recursive": true});
  }
  const path = dir + "/" + fileName;
  writeFileSync(path, JSON.stringify(content, null, 2));
}

test("Load 'adresní-místa' model.", async () => {
  const [actual, entities] = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/adresní-místa");
  writeJson(entities, "./test-output/model", "adresní-místa.json");
});

test("Load 'datové-schránky' model.", async () => {
  const [actual, entities] = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/datové-schránky");
  writeJson(entities, "./test-output/model", "datové-schránky.json");
});

test("Load 'orgány-veřejné-moci' model.", async () => {
  const [actual, entities] = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/orgány-veřejné-moci");
  writeJson(entities, "./test-output/model", "orgány-veřejné-moci.json");
});

test("Load 'osoby-právní-forma' model.", async () => {
  const [actual, entities] = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/osoby-právní-forma");
  writeJson(entities, "./test-output/model", "osoby-právní-forma.json");
});

test("Load 'pracoviště' model.", async () => {
  const [actual, entities] = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/pracoviště");
  writeJson(entities, "./test-output/model", "pracoviště.json");
});

test("Load 'ustanovení-právních-předpisů' model.", async () => {
  const [actual, entities] = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/ustanovení-právních-předpisů");
  writeJson(entities, "./test-output/model", "ustanovení-právních-předpisů.json");
});

test("Load 'zařazení-do-kategorií' model.", async () => {
  const [actual, entities] = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/zařazení-do-kategorií");
  writeJson(entities, "./test-output/model", "zařazení-do-kategorií.json");
});
