import {SparqlSource} from "./sparql-source";
import {RdfEntity} from "./statement-api";

test("Load from SPARQL.", async () => {
  const endpoint = "https://slovník.gov.cz/sparql";
  const url = "https://slovník.gov.cz/generický/věci/pojem/název";
  const source = await SparqlSource.create(endpoint);
  const actual =
    await source.properties(
      RdfEntity.create(url),
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
  // Class, DatatypeProperty, skos:Concept, Intrinsic Trope Type
  console.log("actual", actual);
});
