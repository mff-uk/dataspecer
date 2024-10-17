import { useRef, useEffect, useState } from "react";

import {
    type SemanticModelGeneralization,
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelClass,
    isSemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { type WritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { IriLink } from "../components/iri-link";
import { useBaseDialog } from "../components/base-dialog";
import { sourceModelOfEntity } from "../util/model-utils";
import { useModelGraphContext } from "../context/model-context";
import { capFirst } from "../util/name-utils";
import { ResourceDetailClickThrough } from "../components/entity-detail-dialog-clicktrough-component";
import { EntityProxy, getEntityTypeString } from "../util/detail-utils";
import { DialogDetailRow } from "../components/dialog/dialog-detail-row";
import { ScrollableResourceDetailClickThroughList } from "../components/scrollable-detail-click-through";
import { DialogColoredModelHeaderWithLanguageSelector } from "../components/dialog/dialog-colored-model-header";
import { CloseButton } from "../components/dialog/buttons/close-button";
import { t } from "../application";
import { useActions } from "../action/actions-react-binding";
import { useOptions } from "../application/options";

type EntityDialogSupportedType =
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassUsage
    | SemanticModelRelationshipUsage
    | SemanticModelGeneralization;

export const useEntityDetailDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const editDialogRef = useRef(null as unknown as HTMLDialogElement);
    // we open the dialog with this entity, since you can view related items in the same dialog
    // we also change the viewed entity state there
    const [initialViewedEntity, setInitialViewedEntity] = useState(null as unknown as EntityDialogSupportedType);

    useEffect(() => {
        const { current: element } = editDialogRef;
        if (isOpen && element !== null) element.showModal();
    }, [isOpen]);

    const localClose = () => {
        setInitialViewedEntity(null as unknown as EntityDialogSupportedType);
        close();
    };
    const localOpen = (entity: EntityDialogSupportedType) => {
        setInitialViewedEntity(entity);
        open();
    };

    const EntityDetailDialog = () => {
        const { language: preferredLanguage } = useOptions();
        const [currentLang, setCurrentLang] = useState<string>(preferredLanguage);
        const [viewedEntity, setViewedEntity] = useState(initialViewedEntity);

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

        const isInActiveView = aggregatorView.getActiveVisualModel()?.getVisualEntityForRepresented(viewedEntity.id) !== null;

        const [addToActiveViewButtonClicked, setAddToActiveViewButtonClicked] = useState(isInActiveView);
        const canBeAddedToActiveView = isSemanticModelClass(viewedEntity) || isSemanticModelClassUsage(viewedEntity);

        const isRelationship = isSemanticModelRelationship(viewedEntity);
        const isRelationshipProfile = isSemanticModelRelationshipUsage(viewedEntity);

        const actions = useActions();

        const handleAddEntityToActiveView = (entityId: string) => {
            const visualModel = aggregatorView.getActiveVisualModel() as WritableVisualModel;
            if (visualModel === null || sourceModel?.getId() === undefined) {
                return;
            }
            if (isRelationship) {
                actions.addRelationToVisualModel(sourceModel.getId(), entityId);
            } else {
                actions.addNodeToVisualModel(sourceModel.getId(), entityId);
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
                        style="grid md:grid-cols-[20%_80%] md:grid-rows-1 md:py-2 md:pl-8"
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
                                <DialogDetailRow detailKey={t("entity-detail-dialog.direct-profile")}>
                                    <ResourceDetailClickThrough
                                        detailDialogLanguage={currentLang}
                                        resource={profileOf}
                                        onClick={() => handleResourceClickThroughClicked(profileOf)}
                                        withIri={true}
                                    />
                                </DialogDetailRow>
                            )}
                            {originalProfile && originalProfile.id != profileOf?.id && (
                                <DialogDetailRow detailKey={t("entity-detail-dialog.original-profile")}>
                                    <ResourceDetailClickThrough
                                        detailDialogLanguage={currentLang}
                                        resource={originalProfile}
                                        onClick={() => handleResourceClickThroughClicked(originalProfile)}
                                        withIri={true}
                                    />
                                </DialogDetailRow>
                            )}
                            {profiledBy.length > 0 && (
                                <DialogDetailRow detailKey={t("entity-detail-dialog.profiled-by")}>
                                    <ScrollableResourceDetailClickThroughList
                                        detailDialogLanguage={currentLang}
                                        resources={profiledBy}
                                        onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                    />
                                </DialogDetailRow>
                            )}
                        </>
                        {specializationOf.length > 0 && (
                            <DialogDetailRow detailKey={t(isRelationship || isRelationshipProfile ?
                            "entity-detail-dialog.specialization-of-property" :
                            "entity-detail-dialog.specialization-of")}>
                                <ScrollableResourceDetailClickThroughList
                                    detailDialogLanguage={currentLang}
                                    resources={specializationOf}
                                    onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                />
                            </DialogDetailRow>
                        )}
                        {generalizationOf.length > 0 && (
                            <DialogDetailRow detailKey={t("entity-detail-dialog.generalization-of")}>
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
                    <DialogDetailRow detailKey={t("entity-detail-dialog.type")}>{getEntityTypeString(viewedEntity)}</DialogDetailRow>
                    <DialogDetailRow detailKey={t("entity-detail-dialog.description")}>{description}</DialogDetailRow>

                    {/*
                    ---------------------------------
                    attributes and attribute profiles
                    ---------------------------------
                    */}

                    {attributes.length > 0 && (
                        <DialogDetailRow detailKey={t("entity-detail-dialog.attributes")}>
                            <ScrollableResourceDetailClickThroughList
                                detailDialogLanguage={currentLang}
                                resources={attributes}
                                onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                            />
                        </DialogDetailRow>
                    )}

                    {attributeProfiles.length > 0 && (
                        <DialogDetailRow detailKey={t("entity-detail-dialog.attributes-profiles")}>
                            <ScrollableResourceDetailClickThroughList
                                detailDialogLanguage={currentLang}
                                resources={attributeProfiles}
                                onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                            />
                        </DialogDetailRow>
                    )}
                    {usageNote && <DialogDetailRow detailKey={t("entity-detail-dialog.usage-note")}>{usageNote}</DialogDetailRow>}

                    {/*
                    ---------------------------------------------
                    domain and range for relationships (profiles)
                    ---------------------------------------------
                    */}

                    {domain.entity && (
                        <DialogDetailRow detailKey={t("entity-detail-dialog.domain")}>
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
                        <DialogDetailRow detailKey={t("entity-detail-dialog.range")}>
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
                        <DialogDetailRow detailKey={t("entity-detail-dialog.datatype")}>
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
