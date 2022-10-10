import { coreResourcesToConceptualModel } from "@dataspecer/core/conceptual-model";
import { CoreResource, ReadOnlyMemoryStore } from "@dataspecer/core/core";
import { DataPsmSchema } from "@dataspecer/core/data-psm/model";
import { DataPsmSchemaXmlExtension } from "@dataspecer/core/data-psm/xml-extension/model";
import { DataSpecification, DataSpecificationSchema } from "@dataspecer/core/data-specification/model";
import { ArtefactGeneratorContext } from "@dataspecer/core/generator";
import { coreResourcesToStructuralModel } from "@dataspecer/core/structure-model";
import { getResource } from "../../xml/tests/resources/resource-provider";
import { XsltLiftingGenerator } from "../xslt-generator";
import { xmlMatchIsClass, xmlMatchIsCodelist, xmlMatchIsLiteral, XmlTransformation } from "../xslt-model";
import { XSLT_LIFTING, XSLT_LOWERING } from "../xslt-vocabulary";

const testPrefix = "XSLT generator: ";

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

  const generator = new XsltLiftingGenerator();

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
    transformation: result,
    resource: storeResources[psmIri] as DataPsmSchema
  }
}

let object1: ReturnType<typeof createObject>;

async function getTransformation1() {
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

test(testPrefix + "namespace declaration", async () => {
  const {transformation, resource} = await getTransformation1();
  const extension = DataPsmSchemaXmlExtension.getExtensionData(resource);
  expect(transformation.targetNamespace).toBe(extension.namespace);
  expect(transformation.targetNamespacePrefix).toBe(extension.namespacePrefix);
});

test(testPrefix + "RDF namespaces", async () => {
  const {transformation} = await getTransformation1();
  expect(transformation.rdfNamespaces).toEqual({
    "ns0": "https://slovník.gov.cz/datový/turistické-cíle/pojem/",
    "ns1": "https://slovník.gov.cz/legislativní/sbírka/128/2000/pojem/",
    "ns2": "https://slovník.gov.cz/generický/veřejná-místa/pojem/",
    "ns3": "https://slovník.gov.cz/datový/ofn-úřední-desky/pojem/",
    "ns4": "https://slovník.gov.cz/datový/číselníky/pojem/"
  });
});

function findTemplate(transformation: XmlTransformation, name: string) {
  return transformation.templates.find(t => t.name === name);
}

test(testPrefix + "root template exists", async () => {
  const {transformation} = await getTransformation1();
  expect(transformation.rootTemplates.length).toBe(1);
  const template = transformation.rootTemplates[0];
  expect(template.elementName).toEqual(["testns", "tourist_destination"]);
  expect(template.classIri).toBe("https://slovník.gov.cz/datový/turistické-cíle/pojem/turistický-cíl");
  const templateObject = findTemplate(transformation, template.targetTemplate);
  expect(templateObject).toBeTruthy();
  expect(templateObject.classIri).toBe(template.classIri);
});

test(testPrefix + "root template literal match", async () => {
  const {transformation} = await getTransformation1();
  const template = findTemplate(transformation, transformation.rootTemplates[0].targetTemplate);
  const match = template.propertyMatches[1];
  expectTrue(xmlMatchIsLiteral(match));
  expect(match.interpretation).toEqual(["ns0", "veřejná-přístupnost"]);
  expect(match.propertyName).toEqual(["testns", "public_accessibility"]);
  expect(match.dataTypeIri).toBe("http://www.w3.org/2001/XMLSchema#dateTimeStamp");
  expectTrue(!match.isReverse);
});

test(testPrefix + "root template multi-class match", async () => {
  const {transformation} = await getTransformation1();
  const template = findTemplate(transformation, transformation.rootTemplates[0].targetTemplate);
  const match = template.propertyMatches[5];
  expectTrue(xmlMatchIsClass(match));
  expect(match.targetTemplates).toEqual(
    [
      {
        templateName: "_https_003a_002f_002fofn.gov.cz_002fclass_002f1653643078923-836b-256a-8172",
        typeName: ["testns", "operator"],
        classIri: "https://slovník.gov.cz/generický/veřejná-místa/pojem/provozovatel"
      },
      {
        templateName: "_https_003a_002f_002fofn.gov.cz_002fclass_002f1653643091768-2227-2898-b759",
        typeName: ["testns", "operator_legal"],
        classIri: "https://slovník.gov.cz/generický/veřejná-místa/pojem/provozovatel-jako-právnická-osoba"
      },
      {
        templateName: "_https_003a_002f_002fofn.gov.cz_002fclass_002f1653643094341-01fe-e754-b821",
        typeName: ["testns", "operator_natural1"],
        classIri: "https://slovník.gov.cz/generický/veřejná-místa/pojem/provozovatel-jako-člověk"
      },
      {
        templateName: "_https_003a_002f_002fofn.gov.cz_002fclass_002f1653643225738-9885-511f-af05",
        typeName: ["testns", "operator_natural2"],
        classIri: "https://slovník.gov.cz/generický/veřejná-místa/pojem/provozovatel-jako-člověk"
      },
      {
        templateName: "_https_003a_002f_002fofn.gov.cz_002fclass_002f1656417724365-779b-0d98-86e9",
        typeName: ["testns", "operator2"],
        classIri: "https://slovník.gov.cz/generický/veřejná-místa/pojem/provozovatel"
      }
    ]
  );
});

test(testPrefix + "root template codelist match", async () => {
  const {transformation} = await getTransformation1();
  const template = findTemplate(transformation, transformation.rootTemplates[0].targetTemplate);
  const match = template.propertyMatches[7];
  expectTrue(xmlMatchIsCodelist(match));
});

test(testPrefix + "imports are present", async () => {
  const {transformation} = await getTransformation1();
  expect(transformation.imports.length).toBe(1);
  const importDecl = transformation.imports[0];
  expect(await importDecl.namespace).toBe(null);
  expect(await importDecl.prefix).toBe(null);
  expect(importDecl.locations).toEqual({
    [XSLT_LIFTING.Generator]: "../contact/lifting.xslt",
    [XSLT_LOWERING.Generator]: "../contact/lowering.xslt"
  });
});
