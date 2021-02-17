import {JsonldSource} from "../rdf/statements/jsonld-source";
import {FederatedSource} from "../rdf/statements/federated-source";
import {loadFromIri} from "./platform-model-adapter";

test("Load PIM from example for věc.", async () => {
  const source = await JsonldSource.create("file://test/ofn-pim.ttl");
  const entities = {};
  const actual = await loadFromIri(
    source, entities, "https://ofn.gov.cz/zdroj/pim/schéma/věc");
  console.log(JSON.stringify(actual, null, 2));
  console.log(JSON.stringify(entities, null, 2));
});

test("Load PSM from example for veřejné-místo.", async () => {
  const source = await JsonldSource.create("file://test/ofn-psm.ttl");
  const entities = {};
  const actual = await loadFromIri(
    source, entities, "https://ofn.gov.cz/zdroj/psm/schéma/veřejné-místo");
  console.log(JSON.stringify(actual, null, 2));
  console.log(JSON.stringify(entities, null, 2));
});

test("Load PSM, PIM, CIM from example for věc.", async () => {
  const source = FederatedSource.create([
    await JsonldSource.create("file://test/ofn-psm.ttl"),
    await JsonldSource.create("file://test/ofn-pim.ttl"),
    await JsonldSource.create("file://test/ofn-cim.ttl"),
  ]);
  const entities = {};
  const actual = await loadFromIri(
    source, entities, "https://ofn.gov.cz/zdroj/psm/schéma/věc");
  console.log(JSON.stringify(actual, null, 2));
  console.log(JSON.stringify(entities, null, 2));
});


test("Load from example.", async () => {
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
  const actual = await loadFromIri(
    source, entities,
    "https://ofn.gov.cz/zdroj/psm/schéma/ofn/číselníky"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/adresní-místa"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/datové-schránky"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/orgány-veřejné-moci"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/osoby-právní-forma"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/pracoviště"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/ustanovení-právních-předpisů"
    // "https://ofn.gov.cz/zdroj/psm/schéma/registr-práv-a-povinností/zařazení-do-kategorií"
  );
  console.log(JSON.stringify(entities, null, 2));
});
