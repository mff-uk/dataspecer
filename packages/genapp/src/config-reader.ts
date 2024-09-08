import * as fs from "fs";
import { DataSourceType } from "./engine/graph/datasource";
import { ApplicationGraph, ApplicationGraphType } from "./engine/graph/application-graph";
import { ApplicationGraphNode } from "./engine/graph/application-graph-node";
import { ApplicationGraphEdgeType } from "./engine/graph/application-graph-edge";


export interface ConfigurationReader {
    getAppConfiguration(): ApplicationGraph;
}

export class StaticConfigurationReader implements ConfigurationReader {

    private readonly _graph: ApplicationGraph;

    constructor() {

        let graphInstance: ApplicationGraphType = {
            label: "Application graph",
            specificationIri: "https://ofn.gov.cz/data-specification/c3e8d59e-cee7-482f-8ee6-5fa52a178ab8",
            datasources: [
                {
                    label: "NKOD",
                    endpoint: "https://data.gov.cz/sparql",
                    format: DataSourceType.Rdf
                }
            ],
            nodes: [
                new ApplicationGraphNode(
                    "https://ofn.gov.cz/data-specification/c3e8d59e-cee7-482f-8ee6-5fa52a178ab8",
                    {
                        iri: "https://example.org/application_graph/nodes/1",
                        // Dataset structure from Genapp local specification
                        structure: "https://ofn.gov.cz/schema/1713975101423-6a97-9fb6-b2db",
                        capability: "https://dataspecer.com/application_graph/capability/list",
                        config: {
                            "showHeader": true,
                            "showAsPopup": false
                        }
                    }),
                new ApplicationGraphNode(
                    "https://ofn.gov.cz/data-specification/c3e8d59e-cee7-482f-8ee6-5fa52a178ab8",
                    {
                        iri: "https://example.org/application_graph/nodes/2",
                        // Dataset structure from Genapp local specification
                        structure: "https://ofn.gov.cz/schema/1713975101423-6a97-9fb6-b2db",
                        capability: "https://dataspecer.com/application_graph/capability/detail",
                        config: {}
                    })
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
            graphInstance.specificationIri
        );
    }

    getAppConfiguration(): ApplicationGraph {
        return this._graph;
    }
}

// export class FileConfigurationReader implements ConfigurationReader {

//     private readonly _configFilePath: string;
//     private _configuration: ApplicationConfiguration;

//     constructor(configFilePath: string) {
//         this._configFilePath = configFilePath;
//         this._configuration = {} as ApplicationConfiguration;
//     }

//     getRootAggregateNames(): string[] {
//         return Object.keys(this._configuration);
//     }

//     getAppConfiguration(): ApplicationConfiguration {

//         const fileContent = fs
//             .readFileSync(this._configFilePath)
//             .toString();

//         this._configuration = JSON.parse(fileContent) as ApplicationConfiguration;

//         return this._configuration;
//     }

//     getAggregateConfiguration(aggregateName: string): AggregateConfiguration {
//         const aggConfig = this._configuration[aggregateName];

//         if (!aggConfig) {
//             throw new Error(`No configuration has been found for "${aggregateName}".`);
//         }

//         return aggConfig;
//     }
// }