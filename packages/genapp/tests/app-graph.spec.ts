import { CapabilityType, DETAIL_CAPABILITY_ID, EDIT_CAPABILITY_ID } from "../src/capabilities";
import { ApplicationGraphNodeType } from "../src/engine/graph";
import { ApplicationGraph } from "../src/engine/graph/application-graph";
import { editCapabilityGraphWithNoDetailNode, emptyAppGraph, simpleEdgeGraph, simpleNodeGraph } from "./app-graphs";

test("test empty application graph", () => {

    const appGraph = new ApplicationGraph(
        emptyAppGraph.label,
        emptyAppGraph.datasources,
        emptyAppGraph.nodes,
        emptyAppGraph.edges,
        emptyAppGraph.dataSpecification
    );

    expect(appGraph).not.toBeNull();
    expect(appGraph.nodes).toHaveLength(0);
});

test("test application graph with duplicate node IRIs", () => {

    let duplicateNodeGraph = simpleNodeGraph;
    const graphNode = simpleEdgeGraph.nodes.at(0)!;

    duplicateNodeGraph.nodes = [graphNode, graphNode];

    const graphConstructor = () => {
        new ApplicationGraph(
            simpleNodeGraph.label,
            simpleNodeGraph.datasources,
            simpleNodeGraph.nodes,
            simpleNodeGraph.edges,
            simpleNodeGraph.dataSpecification
        )
    }

    expect(graphConstructor)
    .toThrow();
});

test("test application graph with duplicate edge IRIs", () => {

    const edge = simpleEdgeGraph.edges.at(0)!;
    let duplicateEdgeGraph = simpleEdgeGraph;

    duplicateEdgeGraph.edges = [edge, edge];

    const graphConstructor = () => {
        new ApplicationGraph(
            duplicateEdgeGraph.label,
            duplicateEdgeGraph.datasources,
            duplicateEdgeGraph.nodes,
            duplicateEdgeGraph.edges,
            duplicateEdgeGraph.dataSpecification
        )
    };
    expect(graphConstructor)
    .toThrow();
});

test("test graph generates detail capability before edit", () => {
    const graph = new ApplicationGraph(
        editCapabilityGraphWithNoDetailNode.label,
        editCapabilityGraphWithNoDetailNode.datasources,
        editCapabilityGraphWithNoDetailNode.nodes,
        editCapabilityGraphWithNoDetailNode.edges,
        editCapabilityGraphWithNoDetailNode.dataSpecification
    );

    expect(graph.nodes).toHaveLength(2);
});

test("test graph generates detail capability before edit", () => {

    let graphWithDetailNode = editCapabilityGraphWithNoDetailNode;

    expect(graphWithDetailNode.nodes).toHaveLength(1);

    const graph = new ApplicationGraph(
        graphWithDetailNode.label,
        graphWithDetailNode.datasources,
        graphWithDetailNode.nodes,
        graphWithDetailNode.edges,
        graphWithDetailNode.dataSpecification
    );

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

    const graph = new ApplicationGraph(
        graphWithDetailNode.label,
        graphWithDetailNode.datasources,
        graphWithDetailNode.nodes,
        graphWithDetailNode.edges,
        graphWithDetailNode.dataSpecification
    );

    expect(graph.nodes).toHaveLength(2);
    expect(graph.nodes.at(0)!.getCapabilityInfo().iri).toBe(DETAIL_CAPABILITY_ID);
    expect(graph.nodes.at(1)!.getCapabilityInfo().iri).toBe(EDIT_CAPABILITY_ID);
});
