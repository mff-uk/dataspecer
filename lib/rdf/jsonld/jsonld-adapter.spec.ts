import {fetchJsonLd, RdfFormat} from "./jsonld-adapter";

test("Load psm-rpp-zařazení-do-kategorií.", async () => {
  const url = "file://test/psm-rpp-zařazení-do-kategorií.ttl";
  const actual = await fetchJsonLd(url, RdfFormat.Turtle);
  expect(actual.length).toBe(14);
});
