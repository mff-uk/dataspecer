import {existsSync, mkdirSync, writeFileSync} from "fs";
import {JsonldSource} from "../rdf/statements/jsonld-source";
import {FederatedSource} from "../rdf/statements/federated-source";
import {PlatformModelAdapter} from "./platform-model-adapter";
import {SparqlSource} from "../rdf/statements/sparql-source";

test("Load 'číselníky' model.", async () => {
  const entities = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/ofn/číselníky");
  writeJson(entities, "./test-output/platform-model", "číselníky.json");
}, 10 * 60 * 1000);

async function loadFromTestSourcesGroupTwo(iri: string) {
  const source = FederatedSource.createExhaustive([
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
  const adapter = PlatformModelAdapter.create(source);
  await adapter.loadIriTree(iri);
  return adapter.get();
}

async function writeJson(content, dir: string, fileName: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, {"recursive": true});
  }
  const path = dir + "/" + fileName;
  writeFileSync(path, JSON.stringify(content, null, 2));
}

test("Load 'adresní-místa' model.", async () => {
  const entities = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/adresní-místa");
  writeJson(entities, "./test-output/platform-model", "adresní-místa.json");
}, 10 * 60 * 1000);

test("Load 'datové-schránky' model.", async () => {
  const entities = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/datové-schránky");
  writeJson(entities, "./test-output/platform-model", "datové-schránky.json");
}, 10 * 60 * 1000);

test("Load 'orgány-veřejné-moci' model.", async () => {
  const entities = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/orgány-veřejné-moci");
  writeJson(entities, "./test-output/platform-model", "orgány-veřejné-moci.json");
}, 10 * 60 * 1000);

test("Load 'osoby-právní-forma' model.", async () => {
  const entities = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/osoby-právní-forma");
  writeJson(entities, "./test-output/platform-model", "osoby-právní-forma.json");
}, 10 * 60 * 1000);

test("Load 'pracoviště' model.", async () => {
  const entities = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/pracoviště");
  writeJson(entities, "./test-output/platform-model", "pracoviště.json");
}, 10 * 60 * 1000);

test("Load 'ustanovení-právních-předpisů' model.", async () => {
  const entities = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/ustanovení-právních-předpisů");
  writeJson(entities, "./test-output/platform-model", "ustanovení-právních-předpisů.json");
}, 10 * 60 * 1000);

test("Load 'zařazení-do-kategorií' model.", async () => {
  const entities = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/zařazení-do-kategorií");
  writeJson(entities, "./test-output/platform-model", "zařazení-do-kategorií.json");
}, 10 * 60 * 1000);
