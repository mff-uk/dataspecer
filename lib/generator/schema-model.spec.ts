import {FederatedSource} from "../rdf/federated-source";
import {JsonldSource} from "../rdf/jsonld-source";
import {loadFromIri} from "../platform-model/platform-model-adapter";
import {loadSchemaFromEntities} from "./schema-model-adapter";
import {writeFileSync} from "fs";

async function loadFromTestSources(iri) {
  const source = FederatedSource.create([
    await JsonldSource.create("file://test/00/ofn-psm.ttl"),
    await JsonldSource.create("file://test/00/ofn-pim.ttl"),
    await JsonldSource.create("file://test/00/ofn-cim.ttl"),
  ]);
  const entities = {};
  const entity = await loadFromIri(source, entities, iri);
  return loadSchemaFromEntities(entities, entity.id);
}

function logJson(content) {
  console.log(stringify(content));
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

test("Load časový-okamžik.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/časový-okamžik");
  logJson(actual);
  writeJson(actual, "./temp/časový-okamžik.schema.json");
});

async function writeJson(content: any, path: string) {
  writeFileSync(path, stringify(content));
}

test("Load věc.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/věc");
  logJson(actual);
  writeJson(actual, "./temp/věc.schema.json");
});

test("Load digitální-objekt.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/digitální-objekt");
  logJson(actual);
  writeJson(actual, "./temp/digitální-objekt.schema.json");
});

test("Load kontakt.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/kontakt");
  logJson(actual);
  writeJson(actual, "./temp/kontakt.schema.json");
});

test("Load člověk.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/člověk");
  logJson(actual);
  writeJson(actual, "./temp/člověk.schema.json");
});

test("Load osoba.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/osoba");
  logJson(actual);
  writeJson(actual, "./temp/osoba.schema.json");
});

test("Load místo.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/místo");
  logJson(actual);
  writeJson(actual, "./temp/místo.schema.json");
});

test("Load turistický-cíl.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/turistický-cíl");
  logJson(actual);
  writeJson(actual, "./temp/turistický-cíl.schema.json");
});

test("Load veřejné-místo.", async () => {
  const actual = await loadFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/veřejné-místo");
  logJson(actual);
  writeJson(actual, "./temp/veřejné-místo.schema.json");
});

test("Load orgány-veřejné-moci.", async () => {
  const source = FederatedSource.create([
    // await JsonldSource.create("file://test/01/pim-ofn-číselníky.ttl"),
    // await JsonldSource.create("file://test/01/pim-orgány-veřejné-moci.ttl"),
    // await JsonldSource.create("file://test/01/pim-rpp-adresní-místa.ttl"),
    await JsonldSource.create("file://test/01/pim-rpp-datové-schránky.ttl"),
    // await JsonldSource.create("file://test/01/pim-rpp-orgány-veřejné-moci.ttl"),
    // await JsonldSource.create("file://test/01/pim-rpp-osoby-právní-forma.ttl"),
    // await JsonldSource.create("file://test/01/pim-rpp-pracoviště.ttl"),
    // await JsonldSource.create("file://test/01/pim-rpp-ustanovení-právních-předpisů.ttl"),
    // await JsonldSource.create("file://test/01/pim-rpp-zařazení-do-kategorií.ttl"),
    // await JsonldSource.create("file://test/01/pim-ustanovení-právních-předpisů.ttl"),
    // await JsonldSource.create("file://test/01/psm-ofn-číselníky.ttl"),
    // await JsonldSource.create("file://test/01/psm-rpp-adresní-místa.ttl"),
    await JsonldSource.create("file://test/01/psm-rpp-datové-schránky.ttl"),
    // await JsonldSource.create("file://test/01/psm-rpp-orgány-veřejné-moci.ttl"),
    // await JsonldSource.create("file://test/01/psm-rpp-osoba-právní-forma.ttl"),
    // await JsonldSource.create("file://test/01/psm-rpp-pracoviště.ttl"),
    // await JsonldSource.create("file://test/01/psm-rpp-ustanovení-právních-předpisů.ttl"),
    // await JsonldSource.create("file://test/01/psm-rpp-zařazení-do-kategorií.ttl"),
  ]);
  const entities = {};
  const entity = await loadFromIri(
    source, entities,
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/orgány-veřejné-moci"
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/datové-schránky"
  );
  console.log(entities);
  const actual = loadSchemaFromEntities(entities, entity.id);
  // writeJson(actual, "./temp/orgány-veřejné-moci.json");
  console.log(JSON.stringify(actual, null, 2));
});
