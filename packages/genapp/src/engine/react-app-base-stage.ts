import { ArtifactSaver } from "../utils/artifact-saver";
import { getRelativePath } from "../utils/utils";
import { CapabilityArtifactResultMap, LayerArtifact } from "./layer-artifact";
import { ReactApplicationBaseGenerator } from "./react-app-base-generator";

export class ReactAppBaseGeneratorStage {
    artifactSaver: ArtifactSaver;
    private readonly stageGenerator: ReactApplicationBaseGenerator;

    constructor() {
        this.artifactSaver = new ArtifactSaver(".");
        this.stageGenerator = new ReactApplicationBaseGenerator({
            templatePath: "./scaffolding/App",
            filePath: "./App.tsx"
        });
    }

    generateApplicationBase(artifactsByAggregateName: { [rootAggregateName: string]: CapabilityArtifactResultMap }) {

        const result: { [aggregateName: string]: any } = {};
        Object.entries(artifactsByAggregateName)
            .forEach(([aggregateName, capabilityMap]) => {
                const transformedCapabilityMap = Object.fromEntries(
                    Object.entries(capabilityMap)
                        .map(([capabilityName, capabilityArtifact]) => {
                            return [
                                capabilityName, 
                                {
                                    componentName: capabilityArtifact.exportedObjectName,
                                    relativePath: getRelativePath(
                                        this.artifactSaver.getFullSavePath("./App.tsx"),
                                        capabilityArtifact.filePath
                                    ),
                                    props: { aggregateName: aggregateName },
                                }
                            ]
                        })
                );
                result[aggregateName] = transformedCapabilityMap;
            })

        console.log("RESULT BELOW: ", result);

        const reactBaseLayerArtifact = this.stageGenerator.processTemplate({
            artifacts: result
        });

        return reactBaseLayerArtifact;
    }
}

