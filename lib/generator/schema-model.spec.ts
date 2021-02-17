import {FederatedSource} from "../rdf/statements/federated-source";
import {JsonldSource} from "../rdf/statements/jsonld-source";
import {loadFromIri} from "../platform-model/platform-model-adapter";
import {loadSchemaFromEntities} from "./schema-model-adapter";
import {writeFileSync, existsSync, mkdirSync} from "fs";

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

test("Load 'časový-okamžik'.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/časový-okamžik");
  writeJson(actual, "./test-output/schema", "časový-okamžik.json");
});

async function writeJson(content: any, dir: string, fileName: string) {
  if (!existsSync(dir)){
    mkdirSync(dir);
  }
  const path = dir + "/" + fileName;
  writeFileSync(path, stringify(content));
}

test("Load 'věc'.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/věc");
  writeJson(actual, "./test-output/schema", "věc.json");
});

test("Load 'digitální-objekt'.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/digitální-objekt");
  writeJson(actual, "./test-output/schema", "digitální-objekt.json");
});

test("Load 'kontakt'.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/kontakt");
  writeJson(actual, "./test-output/schema", "kontakt.json");
});

test("Load 'člověk'.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/člověk");
  writeJson(actual, "./test-output/schema", "člověk.json");
});

test("Load 'osoba'.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/osoba");
  writeJson(actual, "./test-output/schema", "osoba.json");
});

test("Load 'místo'.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/místo");
  writeJson(actual, "./test-output/schema", "místo.json");
});

test("Load 'turistický-cíl'.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/turistický-cíl");
  writeJson(actual, "./test-output/schema", "turistický-cíl.json");
});

test("Load 'veřejné-místo'.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/veřejné-místo");
  writeJson(actual, "./test-output/schema", "veřejné-místo.json");
});

test("Load 'orgány-veřejné-moci'.", async () => {
  const source = FederatedSource.create([
    await JsonldSource.create("file://test/pim-ofn-číselníky.ttl"),
    await JsonldSource.create("file://test/pim-rpp-orgány-veřejné-moci.ttl"),
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
  ]);
  const entities = {};
  const entity = await loadFromIri(
    source, entities,
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/datové-schránky"
  );
  console.log(entities);
  // const actual = loadSchemaFromEntities(entities, entity.id);
  // writeJson(actual, "./test-output/schema", "datové-schránky.json");
});
