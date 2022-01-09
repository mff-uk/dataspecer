import {parseRdfQuadsWithN3} from "./n3-adapter";
import {RdfNode} from "../rdf-api";

test("Load sample TRIG.", async () => {
  const input = `
  PREFIX c: <http://example.org/cartoons#>
  c:Tom a c:Cat.
  c:Jerry a c:Mouse;
    c:smarterThan c:Tom.`;
  const actual = await parseRdfQuadsWithN3(input);
  const expected = [
    {
      "subject": RdfNode.namedNode("http://example.org/cartoons#Tom"),
      "predicate": RdfNode.namedNode(
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      "object": RdfNode.namedNode("http://example.org/cartoons#Cat"),
      "graph": RdfNode.defaultGraph(),
    },
    {
      "subject": RdfNode.namedNode("http://example.org/cartoons#Jerry"),
      "predicate": RdfNode.namedNode(
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      "object": RdfNode.namedNode("http://example.org/cartoons#Mouse"),
      "graph": RdfNode.defaultGraph(),
    },
    {
      "subject": RdfNode.namedNode("http://example.org/cartoons#Jerry"),
      "predicate": RdfNode.namedNode(
        "http://example.org/cartoons#smarterThan"),
      "object": RdfNode.namedNode("http://example.org/cartoons#Tom"),
      "graph": RdfNode.defaultGraph(),
    },
  ];
  expect(actual).toStrictEqual(expected);
});
