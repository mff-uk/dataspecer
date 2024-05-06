import { type AxiosResponse } from "axios";
import { LayerArtifact } from "../../engine/layer-artifact";
import DalApi from "../dal-generator-api";
import { DalGeneratorStrategy } from "../dal-generator-strategy-interface";
import { StageGenerationContext } from "../../engine/generator-stage-interface";

export class LDKitDalGenerator implements DalGeneratorStrategy {
    
    strategyIdentifier: string = "ldkit";
    private readonly endpoint = "http://localhost:8888";
    private readonly api: DalApi;

    constructor() {
        this.api = new DalApi(this.endpoint);
    }
        
    generateDataLayer(context: StageGenerationContext): Promise<AxiosResponse<LayerArtifact, any>> {
        // TODO: get from passed context
        const aggregateName = context.aggregateName;
        console.log(`       Calling the backend (${this.endpoint}) for DAL with: `, aggregateName);

        return this.api.generateDalLayerArtifact(this.strategyIdentifier, aggregateName);
    }
}
