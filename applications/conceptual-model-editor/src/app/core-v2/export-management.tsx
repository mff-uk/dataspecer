import { generate } from "@dataspecer/core-v2/semantic-model/lightweight-owl";
import { useClassesContext } from "./context/classes-context";
import { useModelGraphContext } from "./context/graph-context";
import { Entity } from "@dataspecer/core-v2/entity-model";
import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { getRandomName } from "../utils/random-gen";

export const ExportManagement = () => {
    const { aggregatorView, models, visualModels } = useModelGraphContext();

    const download = (content: string, name: string, type: string) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: type });
        element.href = URL.createObjectURL(file);
        element.download = name;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="mr-2 flex flex-row">
            <div>
                <button
                    className="bg-[#c7556f] px-1"
                    onClick={async () => {
                        const generatedLightweightOwl = await generate(
                            Object.values(aggregatorView.getEntities())
                                .map((aggregatedEntityWrapper) => aggregatedEntityWrapper.aggregatedEntity)
                                .filter(
                                    (
                                        entityOrNull
                                    ): entityOrNull is /* FIXME: jak dostat spravnej typ, tzn SemEntity a ne Entity? */ SemanticModelEntity => {
                                        return entityOrNull != null;
                                    }
                                )
                        );
                        console.log(generatedLightweightOwl);
                        download(generatedLightweightOwl, `dscme-lw-ontology-${getRandomName(8)}.ttl`, "text/plain");
                    }}
                >
                    💾 lw ontology
                </button>
            </div>
            <div className="ml-1">
                <button
                    className="bg-[#c7556f] px-1"
                    onClick={async () => {
                        const modelDescriptors: {}[] = [];
                        for (const [_, model] of models) {
                            // @ts-ignore
                            modelDescriptors.push(model.serializeModel());
                        }
                        for (const [_, visualModel] of visualModels) {
                            // @ts-ignore
                            modelDescriptors.push(visualModel.serializeModel());
                        }

                        const workspace = JSON.stringify(modelDescriptors);
                        console.log(workspace);
                        download(workspace, `dscme-workspace-${Date.now()}.json`, "application/json");
                    }}
                >
                    💾 workspace
                </button>
            </div>
        </div>
    );
};
