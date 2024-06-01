import {
    type SemanticModelGeneralization,
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { IriLink } from "../components/iri-link";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useBaseDialog } from "../components/base-dialog";
import { sourceModelOfEntity } from "../util/model-utils";
import { useConfigurationContext } from "../context/configuration-context";
import { useModelGraphContext } from "../context/model-context";
import { capFirst } from "../util/name-utils";
import { ResourceDetailClickThrough } from "../components/entity-detail-dialog-clicktrough-component";
import { EntityProxy, getEntityTypeString } from "../util/detail-utils";
import { DialogDetailRow2 } from "../components/dialog/dialog-detail-row";
import { ScrollableResourceDetailClickThroughList } from "../components/scrollable-detail-click-through";
import { DialogColoredModelHeaderWithLanguageSelector } from "../components/dialog/dialog-colored-model-header";
import { CloseButton } from "../components/dialog/buttons/close-button";

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
        const [currentLang, setCurrentLang] = useState<string>(preferredLanguage);
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
            datatype,
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
                                <DialogDetailRow2 detailKey="direct profile of">
                                    <ResourceDetailClickThrough
                                        resource={profileOf}
                                        onClick={() => handleResourceClickThroughClicked(profileOf)}
                                        withIri={true}
                                    />
                                </DialogDetailRow2>
                            )}
                            {originalProfile && originalProfile.id != profileOf?.id && (
                                <DialogDetailRow2 detailKey="the original profiled entity">
                                    <ResourceDetailClickThrough
                                        resource={originalProfile}
                                        onClick={() => handleResourceClickThroughClicked(originalProfile)}
                                        withIri={true}
                                    />
                                </DialogDetailRow2>
                            )}
                            {profiledBy.length > 0 && (
                                <DialogDetailRow2 detailKey="profiled by">
                                    <ScrollableResourceDetailClickThroughList
                                        resources={profiledBy}
                                        onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                    />
                                </DialogDetailRow2>
                            )}
                        </>
                        {specializationOf.length > 0 && (
                            <DialogDetailRow2 detailKey="specialization of">
                                <ScrollableResourceDetailClickThroughList
                                    resources={specializationOf}
                                    onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                />
                            </DialogDetailRow2>
                        )}
                        {generalizationOf.length > 0 && (
                            <DialogDetailRow2 detailKey="generalization of">
                                <ScrollableResourceDetailClickThroughList
                                    resources={generalizationOf}
                                    onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                />
                            </DialogDetailRow2>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-[20%_80%] gap-y-3 bg-slate-100 pl-8">
                    <DialogDetailRow2 detailKey="type">{getEntityTypeString(viewedEntity)}</DialogDetailRow2>
                    <DialogDetailRow2 detailKey="description">{description}</DialogDetailRow2>
                    {attributes.length > 0 && (
                        <DialogDetailRow2 detailKey="attributes">
                            <ScrollableResourceDetailClickThroughList
                                resources={attributes}
                                onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                            />
                        </DialogDetailRow2>
                    )}

                    {attributeProfiles.length > 0 && (
                        <DialogDetailRow2 detailKey="attribute profiles">
                            <ScrollableResourceDetailClickThroughList
                                resources={attributeProfiles}
                                onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                            />
                        </DialogDetailRow2>
                    )}
                    {usageNote && <DialogDetailRow2 detailKey="usage note">{usageNote}</DialogDetailRow2>}
                    {domain.entity && (
                        <DialogDetailRow2 detailKey="domain">
                            <ResourceDetailClickThrough
                                resource={domain.entity}
                                // it ain't null
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                onClick={() => handleResourceClickThroughClicked(domain.entity!)}
                                withCardinality={domain.cardinality}
                            />
                        </DialogDetailRow2>
                    )}
                    {range.entity && (
                        <DialogDetailRow2 detailKey="range">
                            <ResourceDetailClickThrough
                                resource={range.entity}
                                // it ain't null
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                onClick={() => handleResourceClickThroughClicked(range.entity!)}
                                withCardinality={range.cardinality}
                            />
                        </DialogDetailRow2>
                    )}
                    {datatype && (
                        <DialogDetailRow2 detailKey="datatype">
                            {datatype.label ? `${datatype.label} (${datatype.uri})` : datatype.uri}
                        </DialogDetailRow2>
                    )}
                </div>
                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    <CloseButton onClick={close} />
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
