import {
    SemanticModelGeneralization,
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { IriLink } from "../catalog/components/iri-link";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useBaseDialog } from "../components/base-dialog";
import { sourceModelOfEntity } from "../util/model-utils";
import { useConfigurationContext } from "../context/configuration-context";
import { useModelGraphContext } from "../context/model-context";
import { capFirst } from "../util/name-utils";
import { ResourceDetailClickThrough } from "../components/entity-detail-dialog-clicktrough-component";
import { EntityProxy, getEntityTypeString } from "../util/detail-utils";
import { DialogDetailRow } from "../components/dialog-detail-row";
import { ScrollableResourceDetailClickThroughList } from "../components/scrollable-detail-click-through";
import { DialogColoredModelHeaderWithLanguageSelector } from "../components/dialog-colored-model-header";

type EntityDialogSupportedType =
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassUsage
    | SemanticModelRelationshipUsage
    | SemanticModelGeneralization;

export const useEntityDetailDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const editDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [viewedEntity2, setViewedEntity2] = useState(null as unknown as EntityDialogSupportedType);

    useEffect(() => {
        const { current: el } = editDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const localClose = () => {
        setViewedEntity2(null as unknown as EntityDialogSupportedType);
        close();
    };
    const localOpen = (entity: EntityDialogSupportedType) => {
        setViewedEntity2(entity);
        open();
    };

    const EntityDetailDialog = () => {
        const { language: preferredLanguage } = useConfigurationContext();
        const [currentLang, setCurrentLang] = useState(preferredLanguage);
        const [viewedEntity, setViewedEntity] = useState(viewedEntity2);

        const { models: m, aggregatorView } = useModelGraphContext();
        const models = [...m.values()];
        const sourceModel = sourceModelOfEntity(viewedEntity.id, models);

        const {
            name,
            description,
            usageNote,
            iri,
            attributes,
            attributeProfiles,
            domain,
            range,
            specializationOf,
            generalizationOf,
            profileOf,
            profiledBy,
            originalProfile,
        } = EntityProxy(viewedEntity, currentLang);

        const [addToActiveViewButtonClicked, setAddToActiveViewButtonClicked] = useState(
            aggregatorView.getActiveVisualModel()?.getVisualEntity(viewedEntity.id)?.visible ?? false
        );
        const isInActiveView =
            aggregatorView.getActiveVisualModel()?.getVisualEntity(viewedEntity.id)?.visible ?? false;
        const canBeAddedToActiveView = isSemanticModelClass(viewedEntity) || isSemanticModelClassUsage(viewedEntity);

        console.log(viewedEntity, domain, range);

        const handleAddEntityToActiveView = (entityId: string) => {
            const updateStatus = aggregatorView.getActiveVisualModel()?.updateEntity(entityId, { visible: true });
            if (!updateStatus) {
                aggregatorView.getActiveVisualModel()?.addEntity({ sourceEntityId: entityId });
            }
        };

        const handleResourceClickThroughClicked = (e: EntityDialogSupportedType) => {
            setViewedEntity(e);
            setAddToActiveViewButtonClicked(false);
        };

        return (
            <BaseDialog heading={`${capFirst(getEntityTypeString(viewedEntity))} detail`}>
                <div className="bg-slate-100">
                    <DialogColoredModelHeaderWithLanguageSelector
                        activeModel={sourceModel}
                        viewedEntity={viewedEntity}
                        currentLanguage={currentLang}
                        setCurrentLanguage={(l) => setCurrentLang(l)}
                        style="grid grid-cols-[80%_20%] grid-rows-1 py-2 pl-8"
                    />
                    <div className="grid grid-cols-[80%_20%] grid-rows-1 py-2 pl-8">
                        <h5 className="text-xl">
                            Detail of: <span className="font-semibold">{name}</span>
                        </h5>
                        {canBeAddedToActiveView && !isInActiveView && !addToActiveViewButtonClicked && (
                            <button
                                className="w-min text-nowrap"
                                onClick={() => {
                                    handleAddEntityToActiveView(viewedEntity.id);
                                    setAddToActiveViewButtonClicked(true);
                                    localClose();
                                }}
                            >
                                add to view
                            </button>
                        )}
                    </div>
                    <p className="flex flex-row pl-8 text-gray-500" title={iri ?? ""}>
                        <IriLink iri={iri} />
                        {iri}
                    </p>

                    <div className="grid grid-cols-[20%_80%]  pl-8">
                        <>
                            {profileOf && (
                                <DialogDetailRow
                                    detailKey="direct profile of"
                                    detailValue={
                                        <ResourceDetailClickThrough
                                            resource={profileOf}
                                            onClick={() => handleResourceClickThroughClicked(profileOf)}
                                            withIri={true}
                                        />
                                    }
                                />
                            )}
                            {originalProfile && originalProfile.id != profileOf?.id && (
                                <DialogDetailRow
                                    detailKey="the original profiled entity"
                                    detailValue={
                                        <ResourceDetailClickThrough
                                            resource={originalProfile}
                                            onClick={() => handleResourceClickThroughClicked(originalProfile)}
                                            withIri={true}
                                        />
                                    }
                                />
                            )}
                            {profiledBy.length > 0 && (
                                <DialogDetailRow
                                    detailKey="profiled by"
                                    detailValue={
                                        <ScrollableResourceDetailClickThroughList
                                            resources={profiledBy}
                                            onResourceClicked={(resource) =>
                                                handleResourceClickThroughClicked(resource)
                                            }
                                        />
                                    }
                                />
                            )}
                        </>
                        {specializationOf.length > 0 && (
                            <DialogDetailRow
                                detailKey="specialization of"
                                detailValue={
                                    <ScrollableResourceDetailClickThroughList
                                        resources={specializationOf}
                                        onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                    />
                                }
                            />
                        )}
                        {generalizationOf.length > 0 && (
                            <DialogDetailRow
                                detailKey="generalization of"
                                detailValue={
                                    <ScrollableResourceDetailClickThroughList
                                        resources={generalizationOf}
                                        onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                    />
                                }
                            />
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-[20%_80%] gap-y-3 bg-slate-100 pl-8">
                    <DialogDetailRow detailKey="type" detailValue={getEntityTypeString(viewedEntity)} />
                    <DialogDetailRow detailKey="description" detailValue={description} />
                    {attributes.length > 0 && (
                        <DialogDetailRow
                            detailKey="attributes"
                            detailValue={
                                <ScrollableResourceDetailClickThroughList
                                    resources={attributes}
                                    onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                />
                            }
                        />
                    )}

                    {attributeProfiles.length > 0 && (
                        <DialogDetailRow
                            detailKey="attribute profiles"
                            detailValue={
                                <ScrollableResourceDetailClickThroughList
                                    resources={attributeProfiles}
                                    onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                />
                            }
                        />
                    )}
                    {usageNote && <DialogDetailRow detailKey="usage note" detailValue={usageNote} />}
                    {domain.entity && (
                        <DialogDetailRow
                            detailKey="domain"
                            detailValue={
                                <ResourceDetailClickThrough
                                    resource={domain.entity}
                                    onClick={() => handleResourceClickThroughClicked(domain.entity!)}
                                    withCardinality={domain.cardinality}
                                />
                            }
                        />
                    )}
                    {range.entity && (
                        <DialogDetailRow
                            detailKey="range"
                            detailValue={
                                <ResourceDetailClickThrough
                                    resource={range.entity}
                                    onClick={() => handleResourceClickThroughClicked(range.entity!)}
                                    withCardinality={range.cardinality}
                                />
                            }
                        />
                    )}
                </div>
                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    <button onClick={close}>close</button>
                </div>
            </BaseDialog>
        );
    };

    return {
        isEntityDetailDialogOpen: isOpen,
        closeEntityDetailDialog: localClose,
        openEntityDetailDialog: localOpen,
        EntityDetailDialog,
    };
};
