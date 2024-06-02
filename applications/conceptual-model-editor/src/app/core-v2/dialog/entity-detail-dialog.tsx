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
import { DialogDetailRow } from "../components/dialog/dialog-detail-row";
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
                        style="grid md:grid-cols-[80%_20%] md:grid-rows-1 md:py-2 md:pl-8"
                    />

                    {/* 
                    ------------------------------------
                    Top header section with name and iri
                    ------------------------------------
                    */}

                    <div className="grid md:grid-cols-[80%_20%] md:grid-rows-1 md:py-2 md:pl-8">
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

                    {/* 
                    --------------------------------------------
                    profiles / generalizations / specializations
                    --------------------------------------------
                    */}

                    <div className="grid md:grid-cols-[20%_80%] md:pl-8">
                        <>
                            {profileOf && (
                                <DialogDetailRow detailKey="direct profile of">
                                    <ResourceDetailClickThrough
                                        detailDialogLanguage={currentLang}
                                        resource={profileOf}
                                        onClick={() => handleResourceClickThroughClicked(profileOf)}
                                        withIri={true}
                                    />
                                </DialogDetailRow>
                            )}
                            {originalProfile && originalProfile.id != profileOf?.id && (
                                <DialogDetailRow detailKey="the original profiled entity">
                                    <ResourceDetailClickThrough
                                        detailDialogLanguage={currentLang}
                                        resource={originalProfile}
                                        onClick={() => handleResourceClickThroughClicked(originalProfile)}
                                        withIri={true}
                                    />
                                </DialogDetailRow>
                            )}
                            {profiledBy.length > 0 && (
                                <DialogDetailRow detailKey="profiled by">
                                    <ScrollableResourceDetailClickThroughList
                                        detailDialogLanguage={currentLang}
                                        resources={profiledBy}
                                        onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                    />
                                </DialogDetailRow>
                            )}
                        </>
                        {specializationOf.length > 0 && (
                            <DialogDetailRow detailKey="specialization of">
                                <ScrollableResourceDetailClickThroughList
                                    detailDialogLanguage={currentLang}
                                    resources={specializationOf}
                                    onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                />
                            </DialogDetailRow>
                        )}
                        {generalizationOf.length > 0 && (
                            <DialogDetailRow detailKey="generalization of">
                                <ScrollableResourceDetailClickThroughList
                                    detailDialogLanguage={currentLang}
                                    resources={generalizationOf}
                                    onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                />
                            </DialogDetailRow>
                        )}
                    </div>
                </div>

                {/* 
                -------------------------------------
                basic information - type, description
                -------------------------------------
                */}

                <div className="grid gap-y-3 bg-slate-100 md:grid-cols-[20%_80%] md:pl-8">
                    <DialogDetailRow detailKey="type">{getEntityTypeString(viewedEntity)}</DialogDetailRow>
                    <DialogDetailRow detailKey="description">{description}</DialogDetailRow>

                    {/* 
                    ---------------------------------
                    attributes and attribute profiles
                    ---------------------------------
                    */}

                    {attributes.length > 0 && (
                        <DialogDetailRow detailKey="attributes">
                            <ScrollableResourceDetailClickThroughList
                                detailDialogLanguage={currentLang}
                                resources={attributes}
                                onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                            />
                        </DialogDetailRow>
                    )}

                    {attributeProfiles.length > 0 && (
                        <DialogDetailRow detailKey="attribute profiles">
                            <ScrollableResourceDetailClickThroughList
                                detailDialogLanguage={currentLang}
                                resources={attributeProfiles}
                                onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                            />
                        </DialogDetailRow>
                    )}
                    {usageNote && <DialogDetailRow detailKey="usage note">{usageNote}</DialogDetailRow>}

                    {/* 
                    ---------------------------------------------
                    domain and range for relationships (profiles)
                    ---------------------------------------------
                    */}

                    {domain.entity && (
                        <DialogDetailRow detailKey="domain">
                            <ResourceDetailClickThrough
                                detailDialogLanguage={currentLang}
                                resource={domain.entity}
                                // it ain't null
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                onClick={() => handleResourceClickThroughClicked(domain.entity!)}
                                withCardinality={domain.cardinality}
                            />
                        </DialogDetailRow>
                    )}
                    {range.entity && (
                        <DialogDetailRow detailKey="range">
                            <ResourceDetailClickThrough
                                resource={range.entity}
                                detailDialogLanguage={currentLang}
                                // it ain't null
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                onClick={() => handleResourceClickThroughClicked(range.entity!)}
                                withCardinality={range.cardinality}
                            />
                        </DialogDetailRow>
                    )}
                    {datatype && (
                        <DialogDetailRow detailKey="datatype">
                            {datatype.label ? `${datatype.label} (${datatype.uri})` : datatype.uri}
                        </DialogDetailRow>
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
