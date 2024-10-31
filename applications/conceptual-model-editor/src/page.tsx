import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import type { Entity, EntityModel } from "@dataspecer/core-v2/entity-model";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { isVisualModel, isWritableVisualModel, type VisualModel, VisualModelDataVersion, type WritableVisualModel } from "@dataspecer/core-v2/visual-model";
import { type AggregatedEntityWrapper, SemanticModelAggregator, type SemanticModelAggregatorView } from "@dataspecer/core-v2/semantic-model/aggregator";
import {
    type SemanticModelClass,
    type SemanticModelRelationship,
    type SemanticModelGeneralization,
    isSemanticModelClass,
    isSemanticModelGeneralization,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";

import { ClassesContext } from "./context/classes-context";
import { ModelGraphContext } from "./context/model-context";
import { type Warning, WarningsContext } from "./context/warnings-context";
import Header from "./header/header";
import { useBackendConnection } from "./backend-connection";
import { Catalog } from "./catalog/catalog";
import { Visualization } from "./visualization";
import { bothEndsHaveAnIri } from "./util/relationship-utils";
import { getRandomName } from "./util/random-gen";
import { QueryParamsProvider, useQueryParamsContext } from "./context/query-params-context";
import { DialogContextProvider } from "./dialog/dialog-context";
import { DialogRenderer } from "./dialog/dialog-renderer";
import { NotificationList } from "./notification";
import { ActionsContextProvider } from "./action/actions-react-binding";
import { createWritableVisualModel } from "./util/visual-model-utils";
import { OptionsContextProvider } from "./application/options";

import "./page.css";
import { migrateVisualModelFromV0 } from "./dataspecer/visual-model-v0-to-v1";

const semanticModelAggregator = new SemanticModelAggregator();
type SemanticModelAggregatorType = typeof semanticModelAggregator;

const Page = () => {
    // URL query
    const { packageId, viewId, updatePackageId } = useQueryParamsContext();
    // Dataspecer API
    const [aggregator, setAggregator] = useState(new SemanticModelAggregator());
    const [aggregatorView, setAggregatorView] = useState(aggregator.getView());
    const { getModelsFromBackend } = useBackendConnection();
    // Local state
    const [models, setModels] = useState(new Map<string, EntityModel>());
    const [classes, setClasses] = useState<SemanticModelClass[]>([]);
    const [allowedClasses, setAllowedClasses] = useState<string[]>([]);
    const [relationships, setRelationships] = useState<SemanticModelRelationship[]>([]);
    const [generalizations, setGeneralizations] = useState<SemanticModelGeneralization[]>([]);
    const [usages, setUsages] = useState<(SemanticModelClassUsage | SemanticModelRelationshipUsage)[]>([]);
    const [warnings, setWarnings] = useState<Warning[]>([]);
    const [rawEntities, setRawEntities] = useState<(Entity | null)[]>([]);
    const [visualModels, setVisualModels] = useState(new Map<string, WritableVisualModel>());
    const [sourceModelOfEntityMap, setSourceModelOfEntityMap] = useState(new Map<string, string>());
    const [defaultModelAlreadyCreated, setDefaultModelAlreadyCreated] = useState(false);

    // Runs on initial load.
    // If the app was launched without package-id query parameter
    // - creates a default entity model
    // - creates a view for it
    // - registers it with the aggregator
    // else -- the package-id (and view-id) params were provided
    // - downloads the models and views for given package from the backend
    // - deserializes them
    // - registers them at the aggregator
    // - if there was no local model within the package, it creates and registers one as well
    useEffect(() => {
        if (packageId == null) {
            if (defaultModelAlreadyCreated) {
                // We have already created a default package.
                return;
            } else {
                console.log("[INITIALIZATION] No package identifier provided, creating default model.");
                return initializeWithoutPackage(
                    setVisualModels,
                    setModels,
                    setDefaultModelAlreadyCreated,
                    setAggregator,
                    setAggregatorView);
            }
        } else {
            console.log("[INITIALIZATION] Loading models for package.", { packageId });
            return initializeWithPackage(
                packageId, viewId, aggregator,
                getModelsFromBackend,
                setVisualModels,
                setModels,
                setAggregatorView,
                updatePackageId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Registers a subscription callback at the aggregator, that:
    // - removes whatever was removed from the models registered at the aggregator from the `ClassContext`
    // - goes through the updated elements
    // - based on their types puts them to their respective buckets - classes, relationships, etc
    useEffect(() => {
        if (aggregatorView === null) {
            return;
        }

        const callback = (updated: AggregatedEntityWrapper[], removed: string[]) => {
            propagateAggregatorChangesToLocalState(
                updated, removed,
                setClasses, setRelationships,
                setUsages, setGeneralizations, setRawEntities,
                setWarnings, setSourceModelOfEntityMap,
                aggregatorView);
        };
        return aggregatorView?.subscribeToChanges(callback);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aggregatorView]);

    return (
        <QueryParamsProvider>
            <OptionsContextProvider>
                <ModelGraphContext.Provider
                    value={{
                        aggregator,
                        aggregatorView,
                        setAggregatorView,
                        models,
                        setModels,
                        visualModels,
                        setVisualModels,
                    }}
                >
                    <ClassesContext.Provider
                        value={{
                            classes,
                            setClasses,
                            allowedClasses,
                            setAllowedClasses,
                            relationships,
                            setRelationships,
                            generalizations,
                            setGeneralizations,
                            profiles: usages,
                            setProfiles: setUsages,
                            sourceModelOfEntityMap,
                            setSourceModelOfEntityMap,
                            rawEntities,
                            setRawEntities,
                        }}
                    >
                        <WarningsContext.Provider value={{ warnings, setWarnings }}>
                            <DialogContextProvider>
                                <ActionsContextProvider>
                                    <Header />
                                    <main className="w-full flex-grow bg-teal-50  md:h-[calc(100%-48px)]">
                                        <div className="my-0 grid grid-rows-[auto_fit] md:h-full md:grid-cols-[25%_75%] md:grid-rows-1 ">
                                            <Catalog />
                                            <Visualization />
                                        </div>
                                    </main>
                                    <NotificationList />
                                    <DialogRenderer />
                                </ActionsContextProvider>
                            </DialogContextProvider>
                        </WarningsContext.Provider>
                    </ClassesContext.Provider>
                </ModelGraphContext.Provider>
            </OptionsContextProvider>
        </QueryParamsProvider>
    );
};

// This is here for the query context to be provided
// so it can be used by the Page component.
const PageWrapper = () => {
    return (
        <QueryParamsProvider>
            <Page />
        </QueryParamsProvider>
    )
}

export default PageWrapper;

function initializeWithoutPackage(
    setVisualModels: Dispatch<SetStateAction<Map<string, WritableVisualModel>>>,
    setModels: Dispatch<SetStateAction<Map<string, EntityModel>>>,
    setDefaultModelAlreadyCreated: Dispatch<SetStateAction<boolean>>,
    setAggregator: Dispatch<SetStateAction<SemanticModelAggregatorType>>,
    setAggregatorView: Dispatch<SetStateAction<SemanticModelAggregatorView>>,
) {
    const tempAggregator = new SemanticModelAggregator();

    // Create visual model.
    const visualModel = createWritableVisualModel();
    setVisualModels(new Map([[visualModel.getId(), visualModel]]));
    tempAggregator.addModel(visualModel);
    const tempAggregatorView = tempAggregator.getView();
    tempAggregatorView.changeActiveVisualModel(visualModel.getId());

    // Create semantic model.
    const model = new InMemorySemanticModel();
    model.setAlias("Default local model");
    setModels(new Map([[model.getId(), model]]));
    tempAggregator.addModel(model);

    setDefaultModelAlreadyCreated(true);
    setAggregator(tempAggregator);
    setAggregatorView(tempAggregatorView);

    return () => {
        setDefaultModelAlreadyCreated(false);
        setModels(() => new Map<string, EntityModel>());
        setVisualModels(() => new Map<string, WritableVisualModel>());
    };
}

function initializeWithPackage(
    packageId: string,
    viewId: string | null,
    aggregator: SemanticModelAggregatorType,
    getModelsFromBackend: (packageId: string) => Promise<readonly [EntityModel[], VisualModel[]]>,
    setVisualModels: Dispatch<SetStateAction<Map<string, WritableVisualModel>>>,
    setModels: Dispatch<SetStateAction<Map<string, EntityModel>>>,
    setAggregatorView: Dispatch<SetStateAction<SemanticModelAggregatorView>>,
    updatePackageId: (packageId: string | null) => void,
) {
    const getModels = () => getModelsFromBackend(packageId);

    const cleanup = getModels().then((models) => {
        const [entityModels, visualModels] = models;
        if (entityModels.length == 0 && visualModels.length == 0) {
            console.warn("No models returned from backend, creating default models in the package.");

            const visualModel = createWritableVisualModel();
            visualModels.push(visualModel);

            const model = new InMemorySemanticModel();
            model.setAlias("Default local model");
            entityModels.push(model);
        }

        if (!entityModels.find((m) => m instanceof InMemorySemanticModel)) {
            console.warn("No semantic model found in the package, creating a default model.");

            const model = new InMemorySemanticModel();
            model.setAlias("Default local model");
            entityModels.push(model);
        }

        // Add models to aggregator.
        for (const model of visualModels) {
            aggregator.addModel(model);
        }

        for (const model of entityModels) {
            aggregator.addModel(model);
        }

        const aggregatorView = aggregator.getView();
        const visualModelsMap = new Map(visualModels.map((model) => [model.getIdentifier(), model as WritableVisualModel]));
        const entityModelsMap = new Map(entityModels.map((model) => [model.getId(), model]));

        // Perform high-level migration.
        for (const model of visualModels) {
            if (!isWritableVisualModel(model)) {
                // We can not perform migration in read-only models.
                continue;
            }
            if (model.getInitialModelVersion() === VisualModelDataVersion.VERSION_0) {
                migrateVisualModelFromV0(entityModelsMap, aggregatorView.getEntities(), model);
            }
        }

        // Set models to state.
        setVisualModels(visualModelsMap);
        setModels(entityModelsMap);

        const availableVisualModelIds = visualModels.map((model) => model.getIdentifier());

        // Select active visual model.
        if (viewId && availableVisualModelIds.includes(viewId)) {
            aggregatorView.changeActiveVisualModel(viewId);
        } else {
            // choose the first available model.
            const modelId = visualModels.at(0)?.getIdentifier();
            if (modelId) {
                aggregatorView.changeActiveVisualModel(modelId);
            }
        }

        setAggregatorView(aggregatorView);

        return () => {
            console.log("Cleanup for the package loading method.");
            for (const model of [...entityModels, ...visualModels]) {
                try {
                    aggregator.deleteModel(model);
                } catch (err) {
                    console.log("Can't delete model from aggregator.", err);
                }
            }
            setModels(new Map());
            setVisualModels(new Map());
        };
    }).catch((error) => {
        console.error("Can not prepare package.", error);
        updatePackageId(null);
    });

    return async () => {
        (await cleanup)?.();
    };
}

function propagateAggregatorChangesToLocalState(
    updated: AggregatedEntityWrapper[],
    removed: string[],
    // Local state.
    setClasses: Dispatch<SetStateAction<SemanticModelClass[]>>,
    setRelationships: Dispatch<SetStateAction<SemanticModelRelationship[]>>,
    setUsages: Dispatch<SetStateAction<(SemanticModelClassUsage | SemanticModelRelationshipUsage)[]>>,
    setGeneralizations: Dispatch<SetStateAction<SemanticModelGeneralization[]>>,
    setRawEntities: Dispatch<SetStateAction<(Entity | null)[]>>,
    setWarnings: Dispatch<SetStateAction<Warning[]>>,
    setSourceModelOfEntityMap: Dispatch<SetStateAction<Map<string, string>>>,
    aggregator: SemanticModelAggregatorView,
) {
    // Remove items.
    const removedIds = new Set(removed);
    setClasses((prev) => prev.filter((item) => !removedIds.has(item.id)));
    setRelationships((prev) => prev.filter((item) => !removedIds.has(item.id)));
    setUsages((prev) => prev.filter((item) => !removedIds.has(item.id)));
    setGeneralizations((prev) => prev.filter((item) => !removedIds.has(item.id)));
    setRawEntities((prev) => prev.filter((item) => item?.id && !removedIds.has(item?.id)));

    // Prepare update.
    const localSourceMap = new Map<string, string>();
    const {
        updatedClasses,
        updatedRelationships,
        updatedGeneralizations,
        updatedProfiles,
        updatedRawEntities,
    } = updated.reduce(
        (
            {
                updatedClasses,
                updatedRelationships,
                updatedGeneralizations,
                updatedProfiles,
                updatedRawEntities,
            },
            curr
        ) => {
            //
            if (isSemanticModelClass(curr.aggregatedEntity)) {
                return {
                    updatedClasses: updatedClasses.concat(curr.aggregatedEntity),
                    updatedRelationships,
                    updatedGeneralizations,
                    updatedProfiles,
                    updatedRawEntities: updatedRawEntities.concat(curr.rawEntity),
                };
            } else if (isSemanticModelRelationship(curr.aggregatedEntity)) {
                if (bothEndsHaveAnIri(curr.aggregatedEntity)) {
                    console.warn(
                        "Both ends have an IRI, skipping.",
                        curr.aggregatedEntity,
                        curr.aggregatedEntity.ends
                    );
                    setWarnings((prev) =>
                        prev.concat({
                            id: getRandomName(15),
                            type: "unsupported-relationship",
                            message: "both ends have an IRI",
                            object: curr.aggregatedEntity,
                        })
                    );
                    return {
                        updatedClasses,
                        updatedRelationships,
                        updatedGeneralizations,
                        updatedProfiles,
                        updatedRawEntities: updatedRawEntities.concat(curr.rawEntity),
                    };
                }
                return {
                    updatedClasses,
                    updatedRelationships: updatedRelationships.concat(curr.aggregatedEntity),
                    updatedGeneralizations,
                    updatedProfiles,
                    updatedRawEntities: updatedRawEntities.concat(curr.rawEntity),
                };
            } else if (
                isSemanticModelClassUsage(curr.aggregatedEntity) ||
                isSemanticModelRelationshipUsage(curr.aggregatedEntity)
            ) {
                return {
                    updatedClasses,
                    updatedRelationships,
                    updatedGeneralizations,
                    updatedProfiles: updatedProfiles.concat(curr.aggregatedEntity),
                    updatedRawEntities: updatedRawEntities.concat(curr.rawEntity),
                };
            } else if (isSemanticModelGeneralization(curr.aggregatedEntity)) {
                return {
                    updatedClasses,
                    updatedRelationships,
                    updatedGeneralizations: updatedGeneralizations.concat(curr.aggregatedEntity),
                    updatedProfiles,
                    updatedRawEntities: updatedRawEntities.concat(curr.rawEntity),
                };
            } else {
                console.error("Unknown type of updated entity", curr.aggregatedEntity);
                throw new Error("Unknown type of updated entity.");
            }
        },
        {
            updatedClasses: [] as SemanticModelClass[],
            updatedRelationships: [] as SemanticModelRelationship[],
            updatedGeneralizations: [] as SemanticModelGeneralization[],
            updatedProfiles: [] as (SemanticModelClassUsage | SemanticModelRelationshipUsage)[],
            updatedRawEntities: [] as (Entity | null)[],
        }
    );

    const models = aggregator.getModels();
    for (const model of models.values()) {
        const modelId = model.getId();
        if (isVisualModel(model)) {
            // We ignore those.
            continue;
        }
        Object.values(model.getEntities()).forEach((e) => localSourceMap.set(e.id, modelId));
    }
    setSourceModelOfEntityMap(new Map(localSourceMap));

    // Update local state.
    const updatedClassIds = new Set(updatedClasses.map((item) => item.id));
    setClasses((prev) => prev.filter((item) => !updatedClassIds.has(item.id)).concat(updatedClasses));

    const updatedRelationshipIds = new Set(updatedRelationships.map((item) => item.id));
    setRelationships((prev) => prev.filter((item) => !updatedRelationshipIds.has(item.id)).concat(updatedRelationships));

    const updatedGeneralizationIds = new Set(updatedGeneralizations.map((item) => item.id));
    setGeneralizations((prev) => prev.filter((item) => !updatedGeneralizationIds.has(item.id)).concat(updatedGeneralizations));

    const updatedProfileIds = new Set(updatedProfiles.map((item) => item.id));
    setUsages((prev) => prev.filter((item) => !updatedProfileIds.has(item.id)).concat(updatedProfiles));

    const updatedRawEntityIds = new Set(updatedRawEntities.map((item) => item?.id));
    setRawEntities((prev) => prev.filter((item) => !updatedRawEntityIds.has(item?.id)).concat(updatedRawEntities));

}
