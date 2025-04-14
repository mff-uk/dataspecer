import { DataPsmSchema } from "@dataspecer/core/data-psm/model/data-psm-schema";
import { ApplicationGraphNode } from "../src/engine/graph/index.ts";
import { AggregateMetadata, AggregateMetadataCache } from "../src/application-config.ts";
import { simpleNodeGraph } from "./app-graphs.ts";
import { NODE_IRI_BASE } from "./constants.ts";

beforeEach(() => { AggregateMetadataCache.resetCacheContent() });

test("Get simple aggregate metadata without whitespace", () => {

    const node = new ApplicationGraphNode(
        "",
        simpleNodeGraph.nodes.at(0)!
    );

    const mockedNodeSchema: DataPsmSchema = {
        iri: node.getIri(),
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {
            "en": "datastructuremodel"
        },
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: null,
        types: []
    }

    const aggregateMetadata = new AggregateMetadata("", mockedNodeSchema);

    expect(aggregateMetadata.iri).toBe(node.getIri());
    expect(aggregateMetadata.technicalLabel).toBe("datastructuremodel");
    expect(aggregateMetadata.getAggregateNamePascalCase()).toBe("Datastructuremodel");
});

test("Get simple aggregate metadata with technical label defined", () => {

    const node = new ApplicationGraphNode(
        "",
        simpleNodeGraph.nodes.at(0)!
    );

    const mockedNodeSchema: DataPsmSchema = {
        iri: node.getIri(),
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {},
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: "datastructuremodel",
        types: []
    }

    const aggregateMetadata = new AggregateMetadata("", mockedNodeSchema);

    expect(aggregateMetadata.iri).toBe(node.getIri());
    expect(aggregateMetadata.technicalLabel).toBe("datastructuremodel");
    expect(aggregateMetadata.getAggregateNamePascalCase()).toBe("Datastructuremodel");
});

test("Get simple aggregate metadata with whitespace", () => {

    const node = new ApplicationGraphNode(
        "",
        simpleNodeGraph.nodes.at(0)!
    );

    const mockedNodeSchema: DataPsmSchema = {
        iri: node.getIri(),
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {
            "en": "Data Structure Model"
        },
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: null,
        types: []
    }

    const aggregateMetadata = new AggregateMetadata("", mockedNodeSchema);

    expect(aggregateMetadata.iri).toBe(node.getIri());
    expect(aggregateMetadata.technicalLabel).toBe("data-structure-model");
    expect(aggregateMetadata.getAggregateNamePascalCase()).toBe("DataStructureModel");
});

test("Test two structure models with same IRI result in same aggregate metadata", () => {

    const node1 = new ApplicationGraphNode(
        "",
        simpleNodeGraph.nodes.at(0)!
    );

    const mockedNode1Schema: DataPsmSchema = {
        iri: node1.getIri(),
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {
            "en": "Model"
        },
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: null,
        types: []
    }

    const aggregateMetadata1 = new AggregateMetadata("", mockedNode1Schema);
    const repeatedAggregateMetadata1 = new AggregateMetadata("", mockedNode1Schema);

    expect(aggregateMetadata1.iri).toBe(repeatedAggregateMetadata1.iri);
    expect(aggregateMetadata1.aggregateName).toBe(repeatedAggregateMetadata1.aggregateName);
    expect(aggregateMetadata1.technicalLabel).toBe(repeatedAggregateMetadata1.technicalLabel);
});

test("Test two different structure models (by IRI) with same name will result in different technical labels", () => {

    const node1 = new ApplicationGraphNode(
        "",
        simpleNodeGraph.nodes.at(0)!
    );

    const node2 = new ApplicationGraphNode(
        "",
        {
            ...simpleNodeGraph.nodes.at(0)!,
            iri: `${NODE_IRI_BASE}/1234`,
        }
    );

    const mockedNode1Schema: DataPsmSchema = {
        iri: node1.getIri(),
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {
            "en": "Model"
        },
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: null,
        types: []
    }

    const aggregateMetadata1 = new AggregateMetadata("", mockedNode1Schema);

    const mockedNode2Schema: DataPsmSchema = {
        iri: node2.getIri(),
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {
            "en": "Model"
        },
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: null,
        types: []
    }

    const aggregateMetadata2 = new AggregateMetadata("", mockedNode2Schema);

    expect(aggregateMetadata1.iri).toBe(node1.getIri());
    expect(aggregateMetadata1.technicalLabel).toBe("model");
    expect(aggregateMetadata1.getAggregateNamePascalCase()).toBe("Model");

    expect(aggregateMetadata2.iri).toBe(node2.getIri());
    expect(aggregateMetadata2.technicalLabel).toBe("model-1");
    // aggregate names not affected
    expect(aggregateMetadata2.getAggregateNamePascalCase()).toBe(aggregateMetadata1.getAggregateNamePascalCase());
});

test("Test two different structure models (by IRI) with same technical label will result in different technical labels", () => {

    const node1 = new ApplicationGraphNode(
        "",
        simpleNodeGraph.nodes.at(0)!
    );

    const node2 = new ApplicationGraphNode(
        "",
        {
            ...simpleNodeGraph.nodes.at(0)!,
            iri: `${NODE_IRI_BASE}/1234`,
        }
    );

    const mockedNode1Schema: DataPsmSchema = {
        iri: node1.getIri(),
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {},
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: "model",
        types: []
    }

    const aggregateMetadata1 = new AggregateMetadata("", mockedNode1Schema);

    const mockedNode2Schema: DataPsmSchema = {
        iri: node2.getIri(),
        dataPsmHumanDescription: {},
        dataPsmHumanLabel: {},
        dataPsmParts: [],
        dataPsmRoots: [],
        dataPsmTechnicalLabel: "model",
        types: []
    }

    const aggregateMetadata2 = new AggregateMetadata("", mockedNode2Schema);

    expect(aggregateMetadata1.iri).toBe(node1.getIri());
    expect(aggregateMetadata1.technicalLabel).toBe("model");
    expect(aggregateMetadata1.getAggregateNamePascalCase()).toBe("Model");

    expect(aggregateMetadata2.iri).toBe(node2.getIri());
    expect(aggregateMetadata2.technicalLabel).toBe("model-1");
    // aggregate names not affected
    expect(aggregateMetadata2.getAggregateNamePascalCase()).toBe(aggregateMetadata1.getAggregateNamePascalCase());
});
