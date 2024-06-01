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
import { useQueryParamsContext } from "../../context/query-params-context";

export const ExportManagement = () => {
    const { aggregator, aggregatorView, models, visualModels, setAggregatorView, replaceModels } =
        useModelGraphContext();
    const { sourceModelOfEntityMap } = useClassesContext();
    const { saveWorkspaceState } = useLocalStorage();

    const { updatePackageId: setPackage } = useQueryParamsContext();
    const { download } = useDownload();
    const { AutoSaveButton } = useAutoSave();
    const service = useMemo(() => new BackendPackageService("fail-if-needed", httpFetch), []);

    const uploadConfiguration = (contentType: string = "application/json") => {
        return new Promise<string | undefined>((resolve) => {
            const input = document.createElement("input");
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
        aggregatorView.changeActiveVisualModel(activeView ?? visualModels.at(0)?.getId() ?? null);
        setAggregatorView(aggregator.getView());
        console.log("export-management: use configuration finished");
    };

    const handleGenerateLightweightOwl = () => {
        generate(
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
        )
            .then((generatedLightweightOwl) => {
                const date = Date.now();
                download(generatedLightweightOwl, `dscme-lw-ontology-${date}.ttl`, "text/plain");
            })
            .catch((err) => console.log("couldn't generate lw-ontology", err));
    };

    const handleLoadWorkspaceFromJson = () => {
        const loadConfiguration = async (configuration: string) => {
            const { modelDescriptors, activeView } = JSON.parse(configuration) as ExportedConfigurationType;
            const [entityModels, visualModels] = await service.getModelsFromModelDescriptors(modelDescriptors);

            loadWorkSpaceConfiguration(entityModels, visualModels, activeView);
        };

        uploadConfiguration()
            .then((configuration) => {
                if (!configuration) {
                    return;
                }

                console.log("configuration is gonna be used");
                loadConfiguration(configuration).catch((err) => console.log("problem with loading configuration", err));
                setPackage(null);
            })
            .catch(console.error);
    };

    const handleExportWorkspaceToJson = () => {
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
