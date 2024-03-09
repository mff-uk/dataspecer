import { generate } from "@dataspecer/core-v2/semantic-model/lightweight-owl";
import { exportEntitiesAsDataSpecificationTrig } from "@dataspecer/core-v2/semantic-model/data-specification-vocabulary";
import { useModelGraphContext } from "./context/graph-context";
import { SemanticModelEntity } from "@dataspecer/core-v2/semantic-model/concepts";
import { getRandomName } from "../utils/random-gen";
import { BackendPackageService } from "@dataspecer/core-v2/project";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { useMemo } from "react";
import { usePackageSearch } from "./util/package-search";

type ExportedConfigurationType = {
    packageId: string;
    modelDescriptors: any[];
};

export const ExportManagement = () => {
    const {
        aggregator,
        aggregatorView,
        models,
        addModelToGraph,
        visualModels,
        setAggregatorView,
        setVisualModels,
        cleanModels,
    } = useModelGraphContext();
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

    const download = (content: string, name: string, type: string) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: type });
        element.href = URL.createObjectURL(file);
        element.download = name;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const downloadDataSpecification = async () => {
        const entities = Object.values(aggregatorView.getEntities())
            .map((aggregatedEntityWrapper) => aggregatedEntityWrapper.aggregatedEntity)
            .filter(entity => entity !== null);
        const stringContent = await exportEntitiesAsDataSpecificationTrig(entities);
        download(stringContent, `dscme-dsv-${getRandomName(8)}.ttl`, "text/plain");
    };

    return (
        <div className="mr-2 flex flex-row">
            <div className="ml-1">
                <button
                    className="bg-[#c7556f] px-1"
                    title="open workspace from configuration file"
                    onClick={async () => {
                        const configuration = await uploadConfiguration();

                        const loadConfiguration = async (configuration: string) => {
                            cleanModels();
                            const { packageId, modelDescriptors } = JSON.parse(
                                configuration
                            ) as ExportedConfigurationType;
                            const [entityModels, visualModels] = await service.getModelsFromModelDescriptors(
                                modelDescriptors
                            );

                            for (const model of visualModels) {
                                aggregator.addModel(model);
                                setVisualModels((prev) => prev.set(model.getId(), model));
                            }
                            for (const model of entityModels) {
                                addModelToGraph(model);
                            }

                            setAggregatorView(aggregator.getView());
                        };
                        if (configuration) {
                            loadConfiguration(configuration);
                        }
                    }}
                >
                    open workspace
                </button>
            </div>
            <div className="ml-1">
                <button
                    className="bg-[#c7556f] px-1"
                    title="generate workspace configuration file"
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

                        const ws = {
                            packageId: "",
                            modelDescriptors: modelDescriptors,
                        } satisfies ExportedConfigurationType;

                        const workspace = JSON.stringify(ws);
                        download(workspace, `dscme-workspace-${Date.now()}.json`, "application/json");
                    }}
                >
                    💾 workspace
                </button>
            </div>
            <div className="ml-1">
                <button
                    className="bg-[#c7556f] px-1"
                    title="generate lightweight ontology"
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
                        download(generatedLightweightOwl, `dscme-lw-ontology-${getRandomName(8)}.ttl`, "text/plain");
                    }}
                >
                    💾 lw ontology
                </button>
            </div>
            <div className="ml-1">
                <button
                    className="bg-[#c7556f] px-1"
                    title="generate lightweight ontology"
                    onClick={downloadDataSpecification}
                >
                    💾 ds ontology
                </button>
            </div>
        </div>
    );
};
