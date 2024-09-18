import * as fs from "fs";
import { DataSourceType } from "./engine/graph/datasource";
import { ApplicationGraph, ApplicationGraphType } from "./engine/graph/application-graph";
import { ApplicationGraphEdgeType } from "./engine/graph/application-graph-edge";
import { GenappInputArguments } from "./engine/app-generator";

export interface ConfigurationReader {
    getAppConfiguration(): ApplicationGraph;
}

export const ConfigurationReaderFactory = {
    createConfigurationReader(args: GenappInputArguments): ConfigurationReader {
        if (args.appGraphPath) {
            return new FileConfigurationReader(args.appGraphPath);
        }

        return new StaticConfigurationReader();
    }
}

export class StaticConfigurationReader implements ConfigurationReader {

    private readonly _graph: ApplicationGraph;

    constructor() {

        let graphInstance: ApplicationGraphType = {
            label: "Application graph",
            dataSpecification: "https://ofn.gov.cz/data-specification/c3e8d59e-cee7-482f-8ee6-5fa52a178ab8",
            datasources: [
                {
                    label: "NKOD",
                    endpoint: "https://data.gov.cz/sparql",
                    format: DataSourceType.RDF
                }
            ],
            nodes: [
                {
                    iri: "https://example.org/application_graph/nodes/1",
                    // Dataset structure from Genapp local specification
                    structure: "https://ofn.gov.cz/schema/1713975101423-6a97-9fb6-b2db",
                    capability: "https://dataspecer.com/application_graph/capability/list",
                    config: {
                        "showHeader": true,
                        "showAsPopup": false,
                    },
                    label: {
                        "cs": "Seznam datových sad",
                        "en": "List of datasets"
                    }
                },
                {
                    iri: "https://example.org/application_graph/nodes/2",
                    // Dataset structure from Genapp local specification
                    structure: "https://ofn.gov.cz/schema/1713975101423-6a97-9fb6-b2db",
                    capability: "https://dataspecer.com/application_graph/capability/detail",
                    config: {},
                    label: {
                        "cs": "Detail datové sady",
                        "en": "Dataset detail"
                    }
                }
            ],
            edges: [
                {
                    iri: "https://example.org/application_graph/edges/1",
                    source: "https://example.org/application_graph/nodes/1",
                    target: "https://example.org/application_graph/nodes/2",
                    type: ApplicationGraphEdgeType.Transition
                }
            ]
        }

        this._graph = new ApplicationGraph(
            graphInstance.label,
            graphInstance.datasources,
            graphInstance.nodes,
            graphInstance.edges,
            graphInstance.dataSpecification
        );
    }

    getAppConfiguration(): ApplicationGraph {
        return this._graph;
    }
}

export class FileConfigurationReader implements ConfigurationReader {

    private readonly _configFilePath: string;

    constructor(configFilePath: string) {
        this._configFilePath = configFilePath;
    }


    getAppConfiguration(): ApplicationGraph {
        const fileContent = fs
            .readFileSync(this._configFilePath)
            .toString();

        const graph = JSON.parse(fileContent) as ApplicationGraphType;

        const result: ApplicationGraph = new ApplicationGraph(
            graph.label,
            graph.datasources,
            graph.nodes,
            graph.edges,
            graph.dataSpecification
        );
        return result;
    }
}