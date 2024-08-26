import * as fs from "fs";
import { 
    ApplicationGraph,
    ApplicationGraphEdgeType,
    ApplicationGraphType,
    DataSourceType
} from "./application-config";

export interface ConfigurationReader {
    getAppConfiguration(): ApplicationGraph;
}

export class StaticConfigurationReader implements ConfigurationReader {

    private readonly _graph: ApplicationGraph;

    constructor() {

        let graphInstance: ApplicationGraphType = {
            label: "Application graph",
            datasources: [
                {
                    label: "NKOD",
                    endpoint: "https://data.gov.cz/sparql",
                    format: DataSourceType.Rdf
                }
            ],
            nodes: [
                {
                    iri:  "https://example.org/application_graph/nodes/1",
                    structure: "https://ofn.gov.cz/schema/1723477940765-73a8-8ecc-8e45",
                    capability: "https://dataspecer.com/application_graph/capability/list",
                    config: {
                        "showHeader": true,
                        "showAsPopup": false
                    }
                },
                // {
                //     iri: "https://example.org/application_graph/nodes/2",
                //     structure: "https://ofn.gov.cz/schema/1723477612561-03b0-588d-9bcb",
                //     capability: "<detailCapabilityId>",
                //     config: {}
                // }
            ],
            edges: [
                // {
                //     iri: "<edge_iri_1>",
                //     source: "https://example.org/application_graph/nodes/1",
                //     target: "https://example.org/application_graph/nodes/2",
                //     type: ApplicationGraphEdgeType.Transition
                // },
                // {
                //     iri: "<edge_iri_2>",
                //     source: "https://example.org/application_graph/nodes/2",
                //     target: "https://example.org/application_graph/nodes/1",
                //     type: ApplicationGraphEdgeType.Redirection
                // }
            ]
        }

        this._graph = new ApplicationGraph(
                graphInstance.label,
                graphInstance.datasources,
                graphInstance.nodes,
                graphInstance.edges
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