import {fetchJsonLd, RdfFormat} from "./jsonld-adapter";

test("Load JSON-LD file.", async () => {
  const url = "https://data.mvcr.gov.cz/soubory/číselníky/"
    + "typy-pracovních-míst-na-vysoké-škole.jsonld";
  const actual = await fetchJsonLd(url, RdfFormat.JsonLd);
  expect(actual.length).toBeGreaterThan(0);
});

test("Load turtle file.", async () => {
  const url = "https://data.mvcr.gov.cz/soubory/číselníky/"
    + "typy-pracovních-míst-na-vysoké-škole.ttl";
  const actual = await fetchJsonLd(url, RdfFormat.Turtle);
  expect(actual.length).toBeGreaterThan(0);
});

test("Load trig file.", async () => {
  const url = "https://data.mvcr.gov.cz/soubory/číselníky/"
    + "typy-pracovních-míst-na-vysoké-škole.trig";
  const actual = await fetchJsonLd(url, RdfFormat.TriG);
  expect(actual.length).toBeGreaterThan(0);
});

test("Load n-triples file.", async () => {
  const url = "https://data.mvcr.gov.cz/soubory/číselníky/"
    + "typy-pracovních-míst-na-vysoké-škole.nt";
  const actual = await fetchJsonLd(url, RdfFormat.NTriples);
  expect(actual.length).toBeGreaterThan(0);
});

test("Load n-quads file.", async () => {
  const url = "https://data.mvcr.gov.cz/soubory/číselníky/"
    + "typy-pracovních-míst-na-vysoké-škole.nq";
  const actual = await fetchJsonLd(url, RdfFormat.NQuads);
  expect(actual.length).toBeGreaterThan(0);
});
