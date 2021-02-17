import {RdfEntity} from "./rdf-api";
import {JsonldSource} from "./jsonld-source";

test("Load from remote url.", async () => {
  const url = "https://data.mvcr.gov.cz/soubory/číselníky/"
    + "typy-pracovních-míst-na-vysoké-škole.jsonld";
  const source = await JsonldSource.create(url);
  const rootUrl = "https://data.mvcr.gov.cz/zdroj/číselníky/"
    + "typy-pracovních-míst-na-vysoké-škole";
  const root = RdfEntity.create(rootUrl);
  const values = await source.properties(
    root, "http://www.w3.org/2004/02/skos/core#prefLabel");
  expect(values.length).toBe(2);
  await source.fetch(root);
  expect(Object.keys(root.properties).length).toBe(2);
});

test("Expand JSON-LD @list.", async () => {
  const actual = await JsonldSource.create("file://test/rdf/00.jsonld");
  // The list should be transformed to root entities.
  expect(Object.keys(actual.entities).length).toBe(4);
})
