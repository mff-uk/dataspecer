import { coreResourcesToConceptualModel } from "../../conceptual-model";
import { CoreResource, ReadOnlyMemoryStore } from "../../core";
import { DataPsmSchema } from "../../data-psm/model";
import { DataSpecification, DataSpecificationSchema } from "../../data-specification/model";
import { ArtefactGeneratorContext } from "../../generator";
import { coreResourcesToStructuralModel } from "../../structure-model";
import { getResource } from "../../xml/tests/resources/resource-provider";
import { SparqlGenerator } from "../sparql-generator";
import { sparqlElementIsOptional, sparqlElementIsTriple, sparqlElementIsUnion, sparqlNodeIsVariable, SparqlQNameNode, sparqlQueryIsConstruct, SparqlTriple, SparqlUriNode, SparqlVariableNode } from "../sparql-model";

const testPrefix = "SPARQL generator: ";

type DataSpecifications = {[iri: string]: DataSpecification};
type CoreResources = {[iri: string]: CoreResource};

async function createObject(
  specifications: DataSpecifications, storeResources: CoreResources
) {
  const specification = Object.values(specifications)[0];

  const psmIri = specification.psms[0];

  const store = ReadOnlyMemoryStore.create(storeResources);

  const conceptualModel = await coreResourcesToConceptualModel(
    store,
    specification.pim
  );

  let structureModel = await coreResourcesToStructuralModel(
    store,
    psmIri
  );

  const artifact = specification.artefacts.find(
    a => DataSpecificationSchema.is(a) && a.psm === psmIri
  );

  const generator = new SparqlGenerator();

  const context: ArtefactGeneratorContext = {
    specifications: specifications,
    conceptualModels: {[conceptualModel.pimIri]: conceptualModel},
    structureModels: {[structureModel.psmIri]: structureModel},
    reader: {
      readResource: async function(iri: string): Promise<CoreResource> {
        return storeResources[iri];
      },
      listResources: null,
      listResourcesOfType: null
    },
    createGenerator: null,
    findStructureClass: null
  };

  const result = await generator.generateToObject(context, artifact, specification);

  return {
    query: result,
    resource: storeResources[psmIri] as DataPsmSchema
  }
}

let object1: ReturnType<typeof createObject>;

async function getQuery1() {
  if (object1 == null) {
    const specifications = getResource("data_specifications.json");
    const store = getResource("merged_store.json");
    object1 = createObject(specifications, store);
  }
  return await object1;
}

function expectTrue(condition: boolean): asserts condition {
  expect(condition).toBeTruthy();
}

test(testPrefix + "prefixes", async () => {
  const {query} = await getQuery1();
  expect(query.prefixes).toEqual({
    "ns0": "https://slovník.gov.cz/datový/turistické-cíle/pojem/",
    "ns1": "https://slovník.gov.cz/datový/jazyky/pojem/",
    "ns2": "https://slovník.gov.cz/generický/číselníky/pojem/",
    "ns3": "https://slovník.gov.cz/datový/číselníky/pojem/",
    "ns4": "https://slovník.gov.cz/legislativní/sbírka/128/2000/pojem/",
    "ns5": "https://slovník.gov.cz/generický/veřejná-místa/pojem/",
    "ns6": "https://slovník.gov.cz/datový/ofn-úřední-desky/pojem/",
    "ns7": "https://slovník.gov.cz/legislativní/sbírka/500/2004/pojem/",
    "ns8": "https://slovník.gov.cz/generický/bezbariérové-přístupy/pojem/",
    "ns9": "https://slovník.gov.cz/generický/kontakty/pojem/"
  });
});

test(testPrefix + "query structure", async () => {
  const {query} = await getQuery1();
  expectTrue(sparqlQueryIsConstruct(query));
  expect(query.construct).toEqual(query.where);
  expectTrue(sparqlElementIsUnion(query.where.elements[0]));
});

test(testPrefix + "query structure", async () => {
  const {query} = await getQuery1();
  expectTrue(sparqlQueryIsConstruct(query));
  expect(query.construct).toEqual(query.where);
  expectTrue(sparqlElementIsUnion(query.where.elements[0]));
});

test(testPrefix + "properties", async () => {
  const {query} = await getQuery1();
  const rootPattern = query.where.elements[0];
  expectTrue(sparqlElementIsUnion(rootPattern));
  expect(rootPattern.unionPatterns.length).toBe(1);
  const root = rootPattern.unionPatterns[0];
  
  const typeTriple = root.elements[0];
  expectTrue(sparqlElementIsTriple(typeTriple));
  expect(typeTriple).toEqual({
    subject: {
      variableName: "v0"
    } as SparqlVariableNode,
    predicate: {
      uri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
    } as SparqlUriNode,
    object: {
      qname: ["ns0", "turistický-cíl"]
    } as SparqlQNameNode
  } as SparqlTriple);

  expectTrue(sparqlElementIsOptional(root.elements[1]));

  const property = root.elements[2];
  expectTrue(sparqlElementIsTriple(property));
  expect(property).toEqual({
    subject: {
      variableName: "v0"
    } as SparqlVariableNode,
    predicate: {
      qname: ["ns0", "veřejná-přístupnost"]
    } as SparqlQNameNode,
    object: {
      variableName: "v2"
    } as SparqlVariableNode
  } as SparqlTriple);
});
