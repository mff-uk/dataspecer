import {FederatedSource} from "../rdf/statements/federated-source";
import {JsonldSource} from "../rdf/statements/jsonld-source";
import {PlatformModelAdapter} from "../platform-model/platform-model-adapter";
import {loadEntitySchemaFromIri} from "./entity-model-adapter";
import {writeFileSync, existsSync, mkdirSync} from "fs";
import {SparqlSource} from "../rdf/statements/sparql-source";

beforeAll(() => jest.setTimeout(10 * 60 * 1000));

test("Load 'adresní-místa' schema.", async () => {
  const actual = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/adresní-místa");
  writeJson(actual, "./test-output/entity-model", "adresní-místa.json");
});

async function loadFromTestSourcesGroupTwo(iri) {
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

/**
 * Convert JSON with cycles into string with referecnes.
 */
function stringify(content: any): string {
  let refCounter = 0;
  let visitedReference = [];

  const addReferences = (content) => {
    if (content === null || content === undefined) {
      return;
    }
    if (Array.isArray(content)) {
      content.forEach(addReferences);
      return;
    }
    if (typeof content === "object") {
      if (content.$id !== undefined) {
        return;
      }
      if (visitedReference.includes(content)) {
        content.$id = ++refCounter;
        return;
      }
      visitedReference.push(content);
      for (const value of Object.values(content)) {
        addReferences(value);
      }
    }
  };

  addReferences(content);

  let visitedLog = [];
  return JSON.stringify(
    content,
    (key, value) => {
      if (value === null || typeof value !== "object" || value === undefined) {
        return value;
      }
      // Add reference and return stub.
      if (value.$ref) {
        return value;
      }
      if (visitedLog.includes(value)) {
        return {
          "$ref": value.$id,
        };
      }
      //
      visitedLog.push(value);
      return value;
    },
    2
  )
}

async function writeJson(content: any, dir: string, fileName: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, {"recursive": true});
  }
  const path = dir + "/" + fileName;
  writeFileSync(path, stringify(content));
}

// test("Load 'číselníky' schema.", async () => {
//   const actual = await loadFromTestSourcesGroupTwo(
//     "https://ofn.gov.cz/zdroj/psm/schéma/ofn/číselníky");
//   writeJson(actual, "./test-output/entity-model", "číselníky.json");
// });

test("Load 'datové-schránky' schema.", async () => {
  const actual = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/datové-schránky");
  writeJson(actual, "./test-output/entity-model", "datové-schránky.json");
});

test("Load 'orgány-veřejné-moci' schema.", async () => {
  const actual = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/orgány-veřejné-moci");
  writeJson(actual, "./test-output/entity-model", "orgány-veřejné-moci.json");
});

test("Load 'osoby-právní-forma' schema.", async () => {
  const actual = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/osoby-právní-forma");
  writeJson(actual, "./test-output/entity-model", "osoby-právní-forma.json");
});

test("Load 'pracoviště' schema.", async () => {
  const actual = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/pracoviště");
  writeJson(actual, "./test-output/entity-model", "pracoviště.json");
});

test("Load 'ustanovení-právních-předpisů' schema.", async () => {
  const actual = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/ustanovení-právních-předpisů");
  writeJson(actual, "./test-output/entity-model", "ustanovení-právních-předpisů.json");
});

test("Load 'zařazení-do-kategorií' schema.", async () => {
  const actual = await loadFromTestSourcesGroupTwo(
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/zařazení-do-kategorií");
  writeJson(actual, "./test-output/entity-model", "zařazení-do-kategorií.json");
});
