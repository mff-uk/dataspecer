import { LayerArtifact } from "../../engine/layer-artifact";
import { DalGeneratorStrategy } from "../strategy-interface";

export class LocalStorageDalGeneratorStrategy implements DalGeneratorStrategy {

    strategyIdentifier: string = "localStorage";
    
    generateDataLayer(): Promise<LayerArtifact> {
        const localDalLayer: LayerArtifact = {
            filePath: "localStorage-dal.ts",
            exportedObjectName: "", 
            sourceText: `
                localStorage.getItem("<aggregate instance>");
            `
        }

        return Promise.resolve(localDalLayer);
    }
}

