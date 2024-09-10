import { ArtifactSaver } from "../utils/artifact-saver";
import { getRelativePath } from "../utils/utils";
import { LayerArtifact } from "../engine/layer-artifact";
import { CapabilityRouteComponentMap, ReactApplicationBaseGenerator, ReactRouteComponentDescription } from "./react-app-base-generator";
import { NodeResult } from "../engine/app-generator";

export class ReactAppBaseGeneratorStage {
    artifactSaver: ArtifactSaver;
    private readonly stageGenerator: ReactApplicationBaseGenerator;
    private readonly _appBaseFilepath: string = "./App.tsx";

    constructor(saveBaseDir: string) {
        this.artifactSaver = new ArtifactSaver(saveBaseDir, ".");
        this.stageGenerator = new ReactApplicationBaseGenerator({
            templatePath: "./scaffolding/App",
            filePath: this._appBaseFilepath
        });
    }

    async generateApplicationBase(generatedNodes: NodeResult[]): Promise<LayerArtifact> {

        const entries = generatedNodes.map(generatedNode => [
            generatedNode.nodePath,
            {
                componentName: generatedNode.artifact.exportedObjectName,
                capability: generatedNode.capability,
                relativePath: getRelativePath(
                    this.artifactSaver.getFullSavePath(this._appBaseFilepath),
                    generatedNode.artifact.filePath
                ),
                props: {
                    aggregateName: generatedNode.structure.getAggregateNamePascalCase(),
                    iri: generatedNode.structure.iri
                }
            }
        ] as readonly [string, ReactRouteComponentDescription]);

        const capabilityMap: CapabilityRouteComponentMap = Object.fromEntries<ReactRouteComponentDescription>(entries);

        const reactBaseLayerArtifact = await this.stageGenerator.processTemplate({
            aggregate: undefined!,
            capabilityMap: capabilityMap
        });

        this.copyStaticFiles();

        this.artifactSaver.saveArtifact(reactBaseLayerArtifact);

        return reactBaseLayerArtifact;
    }

    private copyStaticFiles() {
        const toCopyTemplatesDirPath = "./scaffolding/copy";

        this.artifactSaver.copy(toCopyTemplatesDirPath);
    }
}