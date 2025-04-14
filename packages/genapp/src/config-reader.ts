import * as fs from "fs";
import { ApplicationGraph, ApplicationGraphType } from "./engine/graph/application-graph.ts";
import { GenappConfiguration } from "./engine/app-generator.ts";

export interface ConfigurationReader {
    getAppConfiguration(): ApplicationGraph;
}

export const ConfigurationReaderFactory = {
    createConfigurationReader(args: GenappConfiguration): ConfigurationReader {
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

        this._graph = new ApplicationGraph(graphInstance);
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

        const appGraph: ApplicationGraph = new ApplicationGraph(graph);
        return appGraph;
    }
}

export class StringLiteralConfigurationReader implements ConfigurationReader {

    private readonly _serializedGraph: ApplicationGraphType;

    constructor(serializedGraph: string) {
        this._serializedGraph = JSON.parse(serializedGraph) as ApplicationGraphType;
    }

    getAppConfiguration(): ApplicationGraph {
        const graph = this._serializedGraph;

        const appGraph: ApplicationGraph = new ApplicationGraph(graph);
        return appGraph;
    }
}