import { LayerArtifact } from "../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../dal-generator-strategy-interface";

export class FileDalGeneratorStrategy implements DalGeneratorStrategy {

    _strategyIdentifier: string = "file<type>";
    private readonly fileType: string;

    constructor(fileType: string) {
        this.fileType = fileType;
    }

    generateDataLayer(): Promise<LayerArtifact> {
        throw new Error(`Method "generateDataLayer" not implemented in FileDalGeneratorStrategy.`);
    }

}

