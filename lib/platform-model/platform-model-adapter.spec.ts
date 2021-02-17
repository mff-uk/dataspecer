import {JsonldSource} from "../rdf/jsonld-source";
import {FederatedSource} from "../rdf/federated-source";
import {loadFromIri} from "./platform-model-adapter";

test("Load PIM from example.", async () => {
  const source = await JsonldSource.create("file://test/00/ofn-pim.ttl");
  const entities = {};
  const actual = await loadFromIri(
    source, entities, "https://ofn.gov.cz/zdroj/pim/schéma/věc");
  console.log(JSON.stringify(actual, null, 2));
  console.log(JSON.stringify(entities, null, 2));
});

test("Load PSM from example.", async () => {
  const source = await JsonldSource.create("file://test/00/ofn-psm.ttl");
  const entities = {};
  const actual = await loadFromIri(
    source, entities, "https://ofn.gov.cz/zdroj/psm/schéma/veřejné-místo");
  console.log(JSON.stringify(actual, null, 2));
  console.log(JSON.stringify(entities, null, 2));
});

test("Load PSM and PIM from example.", async () => {
  const source = FederatedSource.create([
    await JsonldSource.create("file://test/00/ofn-psm.ttl"),
    await JsonldSource.create("file://test/00/ofn-pim.ttl"),
    // await SparqlSource.create("https://slovník.gov.cz/sparql")
  ]);
  const entities = {};
  const actual = await loadFromIri(
    source, entities, "https://ofn.gov.cz/zdroj/psm/schéma/věc");
  console.log(JSON.stringify(actual, null, 2));
  console.log(JSON.stringify(entities, null, 2));
});


test("Load from example 01.", async () => {
  const source = FederatedSource.create([
    await JsonldSource.create("file://test/01/pim-ofn-číselníky.ttl"),
    await JsonldSource.create("file://test/01/pim-orgány-veřejné-moci.ttl"),
    await JsonldSource.create("file://test/01/pim-rpp-adresní-místa.ttl"),
    await JsonldSource.create("file://test/01/pim-rpp-datové-schránky.ttl"),
    await JsonldSource.create("file://test/01/pim-rpp-orgány-veřejné-moci.ttl"),
    await JsonldSource.create("file://test/01/pim-rpp-osoby-právní-forma.ttl"),
    await JsonldSource.create("file://test/01/pim-rpp-pracoviště.ttl"),
    await JsonldSource.create("file://test/01/pim-rpp-ustanovení-právních-předpisů.ttl"),
    await JsonldSource.create("file://test/01/pim-rpp-zařazení-do-kategorií.ttl"),
    await JsonldSource.create("file://test/01/pim-ustanovení-právních-předpisů.ttl"),
    await JsonldSource.create("file://test/01/psm-ofn-číselníky.ttl"),
    await JsonldSource.create("file://test/01/psm-rpp-adresní-místa.ttl"),
    await JsonldSource.create("file://test/01/psm-rpp-datové-schránky.ttl"),
    await JsonldSource.create("file://test/01/psm-rpp-orgány-veřejné-moci.ttl"),
    await JsonldSource.create("file://test/01/psm-rpp-osoba-právní-forma.ttl"),
    await JsonldSource.create("file://test/01/psm-rpp-pracoviště.ttl"),
    await JsonldSource.create("file://test/01/psm-rpp-ustanovení-právních-předpisů.ttl"),
    await JsonldSource.create("file://test/01/psm-rpp-zařazení-do-kategorií.ttl"),
  ]);
  const entities = {};
  const actual = await loadFromIri(
    source, entities,
    // "https://ofn.gov.cz/zdroj/psm/schéma/ofn/číselníky"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/adresní-místa"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/datové-schránky"
    "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/orgány-veřejné-moci"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/osoby-právní-forma"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/pracoviště"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/ustanovení-právních-předpisů"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/zařazení-do-kategorií"
  );
  console.log(JSON.stringify(entities, null, 2));
});