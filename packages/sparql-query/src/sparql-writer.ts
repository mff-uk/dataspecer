import {OutputStream} from "@dataspecer/core/io/stream/output-stream";

import {
  sparqlElementIsOptional,
  sparqlElementIsTriple,
  sparqlElementIsUnion,
  SparqlNode,
  sparqlNodeIsQName,
  sparqlNodeIsUri,
  sparqlNodeIsVariable,
  SparqlPattern,
  SparqlQuery, sparqlQueryIsConstruct, sparqlQueryIsSelect, SparqlTriple,
} from "./sparql-model";

const indentStep = "  ";

import { RDF_TYPE_URI } from "./sparql-model-adapter"

/**
 * Writes a full SPARQL query to a stream.
 */
export async function writeSparqlQuery(
  model: SparqlQuery,
  stream: OutputStream
): Promise<void> {
  await writePrefixes(model.prefixes, stream);
  await writeQueryProjection(model, stream);
  await writeLine("WHERE {", stream);
  await writePattern(model.where, false, indentStep, stream);
  await writeLine("}", stream);
}

async function writeLine(text: string, stream: OutputStream): Promise<void> {
  await stream.write(text);
  await stream.write("\n");
}

/**
 * Writes the namespace prefixes.
 */
async function writePrefixes(
  prefixes: Record<string, string>, stream: OutputStream
) {
  for (const key of Object.keys(prefixes)) {
    await writeLine(`PREFIX ${key}: <${prefixes[key]}>`, stream);
  }
}

/**
 * Writes the projection part of a query, i.e. the SELECT or CONSTRUCT clause. 
 */
async function writeQueryProjection(
  model: SparqlQuery,
  stream: OutputStream
): Promise<void> {
  if (sparqlQueryIsSelect(model)) {
    await stream.write("SELECT");
    for (const select of model.select) {
      await stream.write(" ");
      await stream.write(select);
    }
    await writeLine("", stream);
  } else if (sparqlQueryIsConstruct(model)) {
    await writeLine("CONSTRUCT {", stream);
    await writePattern(model.construct, true, indentStep, stream);
    await writeLine("}", stream);
  }
}

/**
 * Writes a graph pattern.
 * @param pattern The pattern to write.
 * @param onlyTriples Write only RDF triples (used inside CONSTRUCT).
 * @param indent The identation line prefix.
 * @param stream The output stream.
 */
async function writePattern(
  pattern: SparqlPattern,
  onlyTriples: boolean,
  indent: string,
  stream: OutputStream
): Promise<void> {
  for (const element of pattern.elements) {
    if (sparqlElementIsTriple(element)) {
      await writeTriple(element, indent, stream);
    } else if (sparqlElementIsOptional(element)) {
      if (onlyTriples) {
        await writePattern(
          element.optionalPattern, onlyTriples, indent, stream
        );
      } else {
        await writeLine(indent + "OPTIONAL {", stream);
        await writePattern(
          element.optionalPattern, onlyTriples, indent + indentStep, stream
        );
        await writeLine(indent + "}", stream);
      }
    } else if (sparqlElementIsUnion(element)) {
      if (onlyTriples || element.unionPatterns.length <= 1) {
        // Do not write UNION for just one pattern.
        for (const pattern of element.unionPatterns) {
          await writePattern(
            pattern, onlyTriples, indent, stream
          );
        }
      } else {
        let first = true;
        for (const pattern of element.unionPatterns) {
          await writeLine(indent + (first ? "{" : "} UNION {"), stream);
          await writePattern(
            pattern, onlyTriples, indent + indentStep, stream
          );
          first = false;
        }
        await writeLine(indent + "}", stream);
      }
    }
  }
}

/**
 * Writes out a triple.
 */
async function writeTriple(
  triple: SparqlTriple, indent: string, stream: OutputStream
): Promise<void> {
  await stream.write(indent);
  await writeNode(triple.subject, stream, false);
  await stream.write(" ");
  await writeNode(triple.predicate, stream, true);
  await stream.write(" ");
  await writeNode(triple.object, stream, false);
  await writeLine(" .", stream);
}

/**
 * Writes out a SPARQL node.
 * @param node The node to write.
 * @param stream The output stream.
 * @param isPredicate True if inside a predicate (shorten rdf:type to a).
 */
async function writeNode(
  node: SparqlNode, stream: OutputStream, isPredicate: boolean
): Promise<void> {
  if (sparqlNodeIsUri(node)) {
    if (node.uri === RDF_TYPE_URI && isPredicate) {
      await stream.write("a");
    } else {
      await stream.write(`<${node.uri}>`);
    }
  } else if (sparqlNodeIsVariable(node)) {
    await stream.write(`?${node.variableName}`);
  } else if (sparqlNodeIsQName(node)) {
    await stream.write(`${node.qname[0]}:${node.qname[1]}`);
  }
}
