import {FederatedSource} from "../../rdf/statement/federated-source";
import {JsonldSource} from "../../rdf/statement/jsonld-source";
import {loadFromIri} from "../../platform-model/platform-model-adapter";
import {
  JsonldContextGeneratorOptions,
  generateJsonLdContext
} from "./jsonld-context";
import fetchUrl from "../../rdf/rdf-fetch";

async function generateFromTestSources(iri, options) {
  const source = FederatedSource.create([
    await JsonldSource.create("file://test/ofn-psm.ttl"),
    await JsonldSource.create("file://test/ofn-pim.ttl"),
  ]);
  const entities = {};
  const entity = await loadFromIri(source, entities, iri);
  return generateJsonLdContext(entities, entity, options);
}

test("Generate věc.ssp.jsonld", async () => {
  const options = new JsonldContextGeneratorOptions();
  options.scoped = false;
  const actual = await generateFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/věc", options);
  const expected = await (await fetchUrl(
    "file://test/context/věc.ssp.jsonld", {})).json();
  expect(actual).toEqual(expected);
});

test("Generate digitální-objekt.ssp.scoped.jsonld", async () => {
  const options = new JsonldContextGeneratorOptions();
  options.scoped = true;
  const actual = await generateFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/digitální-objekt", options);
  const expected = await (await fetchUrl(
    "file://test/context/digitální-objekt.ssp.scoped.jsonld", {})).json();
  expect(actual).toEqual(expected);
});

test("Generate časový-okamžik.ssp.scoped.jsonld", async () => {
  const options = new JsonldContextGeneratorOptions();
  options.scoped = true;
  const actual = await generateFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/časový-okamžik", options);
  const expected = await (await fetchUrl(
    "file://test/context/časový-okamžik.ssp.scoped.jsonld", {})).json();
  expect(actual).toEqual(expected);
});

test("Generate kontakt.ssp.scoped.jsonld", async () => {
  const options = new JsonldContextGeneratorOptions();
  options.scoped = true;
  const actual = await generateFromTestSources(
    "https://ofn.gov.cz/zdroj/psm/schéma/kontakt", options);
  const expected = await (await fetchUrl(
    "file://test/context/kontakt.ssp.scoped.jsonld", {})).json();
  expect(actual).toEqual(expected);
});

// test("Generate veřejné-místo.ssp.scoped.jsonld", async () => {
//   const options = new JsonldContextGeneratorOptions();
//   options.scoped = false;
//   const actual = await generateFromTestSources(
//     "https://ofn.gov.cz/zdroj/psm/schéma/veřejné-místo", options);
//   const expected = await (await fetchUrl(
//     "file://test/context/veřejné-místo.ssp.scoped.jsonld", {})).json();
//   expect(actual).toEqual(expected);
// });

// test("Generate turistický-cíl.ssp.scoped.jsonld", async () => {
//   const options = new JsonldContextGeneratorOptions();
//   options.scoped = false;
//   const actual = await generateFromTestSources(
//     "https://ofn.gov.cz/zdroj/psm/schéma/turistický-cíl", options);
//   const expected = await (await fetchUrl(
//     "file://test/context/turistický-cíl.ssp.scoped.jsonld", {})).json();
//   expect(actual).toEqual(expected);
// });
