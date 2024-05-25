import { useMemo } from "react";
import { generate } from "@dataspecer/core-v2/semantic-model/lightweight-owl";
import type { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { BackendPackageService } from "@dataspecer/core-v2/project";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import type { EntityModel } from "@dataspecer/core-v2/entity-model";
import type { VisualEntityModel } from "@dataspecer/core-v2/visual-model";
import { type ExportedConfigurationType, modelsToWorkspaceString, useLocalStorage } from "../export/export-utils";
import { useModelGraphContext } from "../../context/model-context";
import { useDownload } from "../export/download";
import { useClassesContext } from "../../context/classes-context";
import { getIri, getModelIri, entityWithOverriddenIri } from "../../util/iri-utils";
import { ExportButton } from "../../components/management/buttons/export-button";
import { useAutoSave } from "../autosave";

export const ExportManagement = () => {
    const { aggregator, aggregatorView, models, visualModels, setAggregatorView, replaceModels } =
        useModelGraphContext();
    const { sourceModelOfEntityMap } = useClassesContext();
    const { saveWorkspaceState } = useLocalStorage();
    const { download } = useDownload();
    const { AutoSaveButton } = useAutoSave();
    const service = useMemo(() => new BackendPackageService("fail-if-needed", httpFetch), []);

    const uploadConfiguration = (contentType: string = "application/json") => {
        return new Promise<string | undefined>((resolve) => {
            let input = document.createElement("input");
            input.type = "file";
            input.multiple = false;
            input.accept = contentType;

            input.onchange = () => {
                const file = input.files?.[0];
                if (!file) {
                    resolve(undefined);
                    return;
                }

                const fileReader = new FileReader();
                fileReader.readAsText(file);

                fileReader.onload = (readerEvent) => {
                    const content = readerEvent?.target?.result;
                    if (typeof content == "string") {
                        resolve(content);
                        return;
                    }
                    resolve(undefined);
                };
            };

            input.click();
        });
    };

    const loadWorkSpaceConfiguration = (
        entityModels: EntityModel[],
        visualModels: VisualEntityModel[],
        activeView?: string
    ) => {
        replaceModels(entityModels, visualModels);
        // addVisualModelToGraph(...visualModels);
        aggregatorView.changeActiveVisualModel(activeView ?? visualModels.at(0)?.getId() ?? null);
        // addModelToGraph(...entityModels);
        setAggregatorView(aggregator.getView());
        console.log("export-management: use configuration finished");
    };

    const handleGenerateLightweightOwl = async () => {
        const generatedLightweightOwl = await generate(
            Object.values(aggregatorView.getEntities())
                .map((aggregatedEntityWrapper) => aggregatedEntityWrapper.aggregatedEntity)
                .filter((entityOrNull): entityOrNull is SemanticModelEntity => {
                    return entityOrNull != null;
                })
                .map((aggregatedEntity) => {
                    const modelBaseIri = getModelIri(models.get(sourceModelOfEntityMap.get(aggregatedEntity.id) ?? ""));
                    const entityIri = getIri(aggregatedEntity, modelBaseIri);

                    if (!entityIri) {
                        return aggregatedEntity;
                    }

                    return entityWithOverriddenIri(entityIri, aggregatedEntity);
                })
        );
        const date = Date.now();
        download(generatedLightweightOwl, `dscme-lw-ontology-${date}.ttl`, "text/plain");
    };

    const handleLoadWorkspaceFromJson = async () => {
        const configuration = await uploadConfiguration();

        const loadConfiguration = async (configuration: string) => {
            const { modelDescriptors, activeView } = JSON.parse(configuration) as ExportedConfigurationType;
            const [entityModels, visualModels] = await service.getModelsFromModelDescriptors(modelDescriptors);

            loadWorkSpaceConfiguration(entityModels, visualModels, activeView);
        };

        if (configuration) {
            console.log("configuration is gonna be used");
            loadConfiguration(configuration);
        }
    };

    const handleExportWorkspaceToJson = async () => {
        const activeView = aggregatorView.getActiveVisualModel()?.getId();
        const date = Date.now();
        const workspace = modelsToWorkspaceString(models, visualModels, date, activeView);
        download(workspace, `dscme-workspace-${date}.json`, "application/json");
        saveWorkspaceState(models, visualModels, activeView);
    };

    return (
        <div className="mr-2 flex flex-row">
            <ExportButton title="open workspace from configuration file" onClick={handleLoadWorkspaceFromJson}>
                📥ws
            </ExportButton>
            <AutoSaveButton />
            <ExportButton title="generate workspace configuration file" onClick={handleExportWorkspaceToJson}>
                💾ws
            </ExportButton>
            <ExportButton title="generate lightweight ontology" onClick={handleGenerateLightweightOwl}>
                💾lw-onto
            </ExportButton>
        </div>
    );
};
