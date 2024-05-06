import { GeneratorStage, type StageGenerationContext } from "../engine/generator-stage-interface";
import { LayerArtifact } from "../engine/layer-artifact";

export class ApplicationLayerStage implements GeneratorStage {
    
    generateStage<TContext extends StageGenerationContext>(context: TContext): Promise<LayerArtifact> {
        return Promise.resolve({} as LayerArtifact);
    }
}

class ListCapabilityApplicationLayerStage {
    
}