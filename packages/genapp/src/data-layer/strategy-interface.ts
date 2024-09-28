import { type AxiosResponse } from "axios";
import { LayerArtifact } from "../engine/layer-artifact";
import { GenerationContext } from "../engine/generator-stage-interface";
import { TemplateConsumer } from "../engine/template-consumer";
import { TemplateDescription } from "../engine/eta-template-renderer";

export interface DalGeneratorStrategy {
    strategyIdentifier: string;
    generateDataLayer(context: GenerationContext): Promise<LayerArtifact> | Promise<AxiosResponse<LayerArtifact, any>>;
}

export interface DalGeneratorStrategyConstructor<T extends TemplateConsumer<R>, R extends TemplateDescription> {
    new (): T;
}