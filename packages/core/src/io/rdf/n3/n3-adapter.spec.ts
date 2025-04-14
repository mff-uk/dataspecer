import { parseRdfQuadsWithN3 } from "./n3-adapter.ts";
import { RdfNode, RdfObject } from "../rdf-api.ts";

test("Load sample TRIG.", async () => {
  const input = `
  PREFIX c: <http://example.org/cartoons#>
  c:Tom a c:Cat.
  c:Jerry a c:Mouse;
  c:smarterThan c:Tom.
  <a> <b> "Some text \\"in quotes\\" and \\\\ backslash."@en .
  <c> <d> 42 .`;
  const actual = await parseRdfQuadsWithN3(input);
  const expected = [
    {
      subject: RdfNode.namedNode("http://example.org/cartoons#Tom"),
      predicate: RdfNode.namedNode(
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
      ),
      object: RdfNode.namedNode("http://example.org/cartoons#Cat"),
      graph: RdfNode.defaultGraph(),
    },
    {
      subject: RdfNode.namedNode("http://example.org/cartoons#Jerry"),
      predicate: RdfNode.namedNode(
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
      ),
      object: RdfNode.namedNode("http://example.org/cartoons#Mouse"),
      graph: RdfNode.defaultGraph(),
    },
    {
      subject: RdfNode.namedNode("http://example.org/cartoons#Jerry"),
      predicate: RdfNode.namedNode("http://example.org/cartoons#smarterThan"),
      object: RdfNode.namedNode("http://example.org/cartoons#Tom"),
      graph: RdfNode.defaultGraph(),
    },
    {
      subject: RdfNode.namedNode("a"),
      predicate: RdfNode.namedNode("b"),
      object: {
        language: "en",
        value: 'Some text "in quotes" and \\ backslash.',
        termType: "Literal",
        datatype: RdfNode.namedNode(
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
        ),
      } as RdfObject,
      graph: RdfNode.defaultGraph(),
    },
    {
      subject: RdfNode.namedNode("c"),
      predicate: RdfNode.namedNode("d"),
      object: {
        language: "",
        value: "42",
        termType: "Literal",
        datatype: RdfNode.namedNode("http://www.w3.org/2001/XMLSchema#integer"),
      } as RdfObject,
      graph: RdfNode.defaultGraph(),
    },
  ];
  expect(actual).toStrictEqual(expected);
});
