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
        if (args.appGraphFile) {
            return new FileConfigurationReader(args.appGraphFile);
        }

        if (args.serializedGraph) {
            return new StringLiteralConfigurationReader(args.serializedGraph);
        }

        return new StaticConfigurationReader();
    }
}

export class StaticConfigurationReader implements ConfigurationReader {

    private readonly _graph: ApplicationGraph;

    constructor() {

        let graphInstance: ApplicationGraphType = {
            label: "Application graph",
            dataSpecification: "",
            datasources: [],
            nodes: [ ],
            edges: [ ]
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

export class StringLiteralConfigurationReader implements ConfigurationReader {

    private readonly _serializedGraph: string;

    constructor(serializedGraph: string) {
        this._serializedGraph = serializedGraph;
    }

    getAppConfiguration(): ApplicationGraph {
        const graph = JSON.parse(this._serializedGraph) as ApplicationGraphType;

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