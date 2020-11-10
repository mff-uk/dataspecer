import {JsonldSource} from "../rdf/statement/jsonld-source";
import {FederatedSource} from "../rdf/statement/federated-source";
import {loadFromIri} from "./platform-model-adapter";

test("Load PIM from example.", async () => {
  const source = await JsonldSource.create("file://test/ofn-pim.ttl");
  const entities = {};
  const actual = await loadFromIri(
    source, entities, "https://ofn.gov.cz/zdroj/pim/schéma/věc");
  console.log(JSON.stringify(actual, null, 2));
  console.log(JSON.stringify(entities, null, 2));
});

test("Load PSM from example.", async () => {
  const source = await JsonldSource.create("file://test/ofn-psm.ttl");
  const entities = {};
  const actual = await loadFromIri(
    source, entities, "https://ofn.gov.cz/zdroj/psm/schéma/veřejné-místo");
  console.log(JSON.stringify(actual, null, 2));
  console.log(JSON.stringify(entities, null, 2));
});

test("Load PSM and PIM from example.", async () => {
  const source = FederatedSource.create([
    await JsonldSource.create("file://test/ofn-psm.ttl"),
    await JsonldSource.create("file://test/ofn-pim.ttl"),
    // await SparqlSource.create("https://slovník.gov.cz/sparql")
  ]);
  const entities = {};
  const actual = await loadFromIri(
    source, entities, "https://ofn.gov.cz/zdroj/psm/schéma/věc");
  console.log(JSON.stringify(actual, null, 2));
  console.log(JSON.stringify(entities, null, 2));
});
