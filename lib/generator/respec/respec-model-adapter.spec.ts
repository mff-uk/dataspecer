import {existsSync, mkdirSync, writeFileSync} from "fs";
import {loadEntitySchemaFromIri} from "../../entity-model/entity-model-adapter";
import {schemaAsReSpec} from "./respec-model-adapter";
import {FederatedSource} from "../../rdf/statements/federated-source";
import {JsonldSource} from "../../rdf/statements/jsonld-source";
import {PlatformModelAdapter} from "../../platform-model/platform-model-adapter";
import {writeReSpec} from "./respec-writer";
import {SparqlSource} from "../../rdf/statements/sparql-source";

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
    await SparqlSource.create("https://slovník.gov.cz/sparql"),
  ]);
  const adapter = PlatformModelAdapter.create(source);
  await adapter.loadIriTree(iri);
  const entities = adapter.get();
  return loadEntitySchemaFromIri(entities, iri);
}

async function writeOutput(content, dir: string, name: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, {"recursive": true});
  }
  writeFileSync(`${dir}/${name}.json`, JSON.stringify(content, null, 2));
  writeReSpec(content, dir, name);
}

test("Convert 'adresní-místa' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/adresní-místa");
  const actual = schemaAsReSpec(input);
  writeOutput(actual, "./test-output/respec", "adresní-místa");
}, 10 * 60 * 1000);

test("Convert 'datové-schránky' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/datové-schránky");
  const actual = schemaAsReSpec(input);
  writeOutput(actual, "./test-output/respec", "datové-schránky");
}, 10 * 60 * 1000);

test("Convert 'orgány-veřejné-moci' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/orgány-veřejné-moci");
  const actual = schemaAsReSpec(input);
  writeOutput(actual, "./test-output/respec", "orgány-veřejné-moci");
}, 10 * 60 * 1000);

test("Convert 'osoby-právní-forma' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/osoby-právní-forma");
  const actual = schemaAsReSpec(input);
  writeOutput(actual, "./test-output/respec", "osoby-právní-forma");
}, 10 * 60 * 1000);

test("Convert 'pracoviště' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/pracoviště");
  const actual = schemaAsReSpec(input);
  writeOutput(actual, "./test-output/respec", "pracoviště");
}, 10 * 60 * 1000);
test("Convert 'ustanovení-právních-předpisů' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/ustanovení-právních-předpisů");
  const actual = schemaAsReSpec(input);
  writeOutput(actual, "./test-output/respec", "ustanovení-právních-předpisů");
}, 10 * 60 * 1000);

test("Convert 'zařazení-do-kategorií'' to respec.", async () => {
  const input = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/zařazení-do-kategorií");
  const actual = schemaAsReSpec(input);
  writeOutput(actual, "./test-output/respec", "zařazení-do-kategorií'");
}, 10 * 60 * 1000);
