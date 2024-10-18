import { DETAIL_CAPABILITY_ID, EDIT_CAPABILITY_ID } from "../src/capabilities";
import { ApplicationGraphNodeType } from "../src/engine/graph";
import { ApplicationGraph } from "../src/engine/graph/application-graph";
import { editCapabilityGraphWithNoDetailNode, emptyAppGraph, simpleEdgeGraph, simpleNodeGraph } from "./app-graphs";

test("test empty application graph", () => {

    const appGraph = new ApplicationGraph(emptyAppGraph);

    expect(appGraph).not.toBeNull();
    expect(appGraph.nodes).toHaveLength(0);
});

test("test application graph with duplicate node IRIs", () => {

    let duplicateNodeGraph = simpleNodeGraph;
    const graphNode = simpleEdgeGraph.nodes.at(0)!;

    duplicateNodeGraph.nodes = [graphNode, graphNode];

    const graphConstructor = () => { new ApplicationGraph(simpleNodeGraph) };

    expect(graphConstructor)
        .toThrow();
});

test("test application graph with duplicate edge IRIs", () => {

    const edge = simpleEdgeGraph.edges.at(0)!;
    let duplicateEdgeGraph = simpleEdgeGraph;

    duplicateEdgeGraph.edges = [edge, edge];

    const graphConstructor = () => { new ApplicationGraph(duplicateEdgeGraph) };
    expect(graphConstructor)
        .toThrow();
});

test("test graph generates detail capability before edit", () => {

    let graphWithDetailNode = editCapabilityGraphWithNoDetailNode;

    expect(graphWithDetailNode.nodes).toHaveLength(1);

    const graph = new ApplicationGraph(graphWithDetailNode);

    // edit capability with no detail capability for same structure model will add the detail capability node _before_
    expect(graph.nodes).toHaveLength(2);
    expect(graph.nodes.at(0)!.getCapabilityInfo().iri).toBe(DETAIL_CAPABILITY_ID);
    expect(graph.nodes.at(1)!.getCapabilityInfo().iri).toBe(EDIT_CAPABILITY_ID);
});

test("test graph generates detail capability before edit even with reverse order", () => {

    let graphWithDetailNode = editCapabilityGraphWithNoDetailNode;
    const editNode = editCapabilityGraphWithNoDetailNode.nodes.at(0)!
    const detailNode: ApplicationGraphNodeType = {
        ...editNode,
        iri: `${editNode.iri}-1`,
        capability: DETAIL_CAPABILITY_ID
    }

    graphWithDetailNode.nodes = [
        editNode,
        detailNode
    ]

    const graph = new ApplicationGraph(graphWithDetailNode);

    expect(graph.nodes).toHaveLength(2);
    expect(graph.nodes.at(0)!.getCapabilityInfo().iri).toBe(DETAIL_CAPABILITY_ID);
    expect(graph.nodes.at(1)!.getCapabilityInfo().iri).toBe(EDIT_CAPABILITY_ID);
});

test("test graph generates detail capability before edit even if detail exists for _different_ structure model", () => {

    let graphWithDetailNode = editCapabilityGraphWithNoDetailNode;
    const editNode = editCapabilityGraphWithNoDetailNode.nodes.at(0)!;
    const detailNode: ApplicationGraphNodeType = {
        ...editNode,
        iri: `${editNode.iri}-1`,
        capability: DETAIL_CAPABILITY_ID
    };

    const detailNodeForDifferentStructureModel: ApplicationGraphNodeType = {
        ...detailNode,
        iri: `${detailNode.iri}-1`,
        structure: `${detailNode.structure}-1`
    };

    graphWithDetailNode.nodes = [
        detailNodeForDifferentStructureModel,
        editNode,
        detailNode
    ]

    const graph = new ApplicationGraph(graphWithDetailNode);

    expect(graph.nodes).toHaveLength(3);

    expect(graph.nodes.at(0)!.getCapabilityInfo().iri).toBe(DETAIL_CAPABILITY_ID);
    expect(graph.nodes.at(0)!.getStructureIri()).toBe(`${detailNode.structure}-1`);

    expect(graph.nodes.at(1)!.getCapabilityInfo().iri).toBe(DETAIL_CAPABILITY_ID);
    expect(graph.nodes.at(1)!.getStructureIri()).toBe(detailNode.structure);

    expect(graph.nodes.at(2)!.getCapabilityInfo().iri).toBe(EDIT_CAPABILITY_ID);
    expect(graph.nodes.at(1)!.getStructureIri()).toBe(detailNode.structure);
});
