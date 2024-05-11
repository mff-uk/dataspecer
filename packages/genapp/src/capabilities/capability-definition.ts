import { StageGenerationContext } from "../engine/generator-stage-interface";
import { LayerArtifact } from "../engine/layer-artifact";
//import { CodeGenerationArtifactMetadata } from "../utils/utils";

export interface Capability {
    identifier: string;
    entryPoint?: LayerArtifact;
    generateCapability(context: StageGenerationContext): Promise<LayerArtifact>;
    
    //generateCapability(aggregateName: string): Promise<CodeGenerationArtifactMetadata>;


    // implementation template
    // datasource required operations template
    // i.e. - overview              requires data read
    //      - new instance creation requires data write
    //      - update                requires data write
    //      - deletion              ~requires data write -> just id
    //          - capability can be decorable by another capability?
};
