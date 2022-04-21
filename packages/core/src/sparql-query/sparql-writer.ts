import {OutputStream} from "../io/stream/output-stream";

import {
  sparqlElementIsOptional,
  sparqlElementIsTriple,
  SparqlNode,
  sparqlNodeIsUri,
  sparqlNodeIsVariable,
  SparqlPattern,
  SparqlQuery, sparqlQueryIsConstruct, sparqlQueryIsSelect, SparqlTriple,
} from "./sparql-model";

import { SPARQL } from "./sparql-vocabulary";

const indentStep = "  ";

export async function writeSparqlQuery(
  model: SparqlQuery,
  stream: OutputStream
): Promise<void> {
  await writePrefixes(model.prefixes, stream);
  await writeQueryProjection(model, stream);
}

async function writeLine(text: string, stream: OutputStream): Promise<void> {
  await stream.write(text);
  await stream.write("\n");
}

async function writePrefixes(
  prefixes: Record<string, string>, stream: OutputStream
) {
  for (const key of Object.keys(prefixes)) {
    await writeLine(`PREFIX ${key}: <${prefixes[key]}>`, stream);
  }
}

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
    await writePattern(model.construct, false, indentStep, stream);
    await writeLine("}", stream);
  }
}

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
        await writeLine("OPTIONAL {", stream);
        await writePattern(
          element.optionalPattern, onlyTriples, indent + indentStep, stream
        );
        await writeLine("}", stream);
      }
    }
  }
}

async function writeTriple(
  triple: SparqlTriple, indent: string, stream: OutputStream
): Promise<void> {
  await stream.write(indent);
  await writeNode(triple.subject, stream);
  await stream.write(" ");
  await writeNode(triple.predicate, stream);
  await stream.write(" ");
  await writeNode(triple.object, stream);
  await writeLine(" .", stream);
}

async function writeNode(
  node: SparqlNode, stream: OutputStream
): Promise<void> {
  if (sparqlNodeIsUri(node)) {
    await stream.write(`<${node.uri}>`);
  } else if (sparqlNodeIsVariable(node)) {
    await stream.write(`?${node.variableName}>`);
  }
}
