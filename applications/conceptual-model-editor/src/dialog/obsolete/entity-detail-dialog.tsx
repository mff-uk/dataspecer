import { useState } from "react";

import {
    type SemanticModelGeneralization,
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelClass,
    isSemanticModelRelationship,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import {
    type SemanticModelClassUsage,
    type SemanticModelRelationshipUsage,
    isSemanticModelAttributeUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { type WritableVisualModel } from "@dataspecer/core-v2/visual-model";

import { IriLink } from "../../components/iri-link";
import { sourceModelOfEntity } from "../../util/model-utils";
import { useModelGraphContext } from "../../context/model-context";
import { ResourceDetailClickThrough } from "../../components/entity-detail-dialog-clicktrough-component";
import { useEntityProxy, getEntityTypeString } from "../../util/detail-utils";
import { DialogDetailRow } from "../../components/dialog/dialog-detail-row";
import { ScrollableResourceDetailClickThroughList } from "../../components/scrollable-detail-click-through";
import { DialogColoredModelHeaderWithLanguageSelector } from "../../components/dialog/dialog-colored-model-header";
import { t } from "../../application";
import { useActions } from "../../action/actions-react-binding";
import { DialogProps, DialogWrapper } from "../dialog-api";

type SupportedTypes =
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassUsage
    | SemanticModelRelationshipUsage
    | SemanticModelGeneralization;

interface EntityDetailState {

    entity: SupportedTypes;

    language: string;

}

export const createEntityDetailDialog = (
    entity: SupportedTypes,
    language: string,
): DialogWrapper<EntityDetailState> => {
    return {
        label: selectLabel(entity),
        component: EntityDetailDialog,
        state: createEntityDetailDialogState(entity, language),
        confirmLabel: null,
        cancelLabel: "detail-dialog.btn-close",
        validate: null,
        onConfirm: null,
        onClose: null,
    };
}

function selectLabel(entity: SupportedTypes) {
    if (isSemanticModelAttribute(entity)) {
        return "detail-dialog.title.attribute";
    } else if (isSemanticModelRelationship(entity)) {
        return "detail-dialog.title.relationship";
    } else if (isSemanticModelAttributeUsage(entity)) {
        return "detail-dialog.title.attribute-profile";
    } else if (isSemanticModelClassUsage(entity)) {
        return "detail-dialog.title.class-profile";
    } else if (isSemanticModelRelationshipUsage(entity)) {
        return "detail-dialog.title.relationship-profile";
    } else {
        return "detail-dialog.title.unknown";
    }
};

function createEntityDetailDialogState(
    entity: SupportedTypes,
    language: string,
): EntityDetailState {
    return {
        entity,
        language,
    };
}

const EntityDetailDialog = (props: DialogProps<EntityDetailState>) => {
    const [language, setLanguage] = useState<string>(props.state.language);
    const graph = useModelGraphContext();
    //
    const entity = props.state.entity;
    const models = [...graph.models.values()];
    const sourceModel = sourceModelOfEntity(entity.id, models);

    const proxy = useEntityProxy(entity, language);

    const isInActiveView = graph.aggregatorView.getActiveVisualModel()?.getVisualEntityForRepresented(entity.id) !== null;

    const [addToActiveViewButtonClicked, setAddToActiveViewButtonClicked] = useState(isInActiveView);
    const canBeAddedToActiveView = isSemanticModelClass(entity) || isSemanticModelClassUsage(entity);
    const isRelationship = isSemanticModelRelationship(entity);
    const isRelationshipProfile = isSemanticModelRelationshipUsage(entity);

    const actions = useActions();

    const handleAddEntityToActiveView = (entityId: string) => {
        const visualModel = graph.aggregatorView.getActiveVisualModel() as WritableVisualModel;
        if (visualModel === null || sourceModel?.getId() === undefined) {
            return;
        }
        if (isRelationship) {
            actions.addRelationToVisualModel(sourceModel.getId(), entityId);
        } else {
            actions.addNodeToVisualModel(sourceModel.getId(), entityId);
        }
    };

    const handleResourceClickThroughClicked = (next: SupportedTypes) => {
        props.changeState({
            entity: next,
            language: props.state.language,
        });
        setAddToActiveViewButtonClicked(false);
    };

    return (
        <>
            <div className="bg-slate-100">
                <DialogColoredModelHeaderWithLanguageSelector
                    activeModel={sourceModel}
                    viewedEntity={entity}
                    currentLanguage={language}
                    setCurrentLanguage={(l) => setLanguage(l)}
                    style="grid md:grid-cols-[20%_80%] md:grid-rows-1 md:py-2 md:pl-8"
                />

                {/*
                ------------------------------------
                Top header section with name and iri
                ------------------------------------
                */}

                <div className="grid md:grid-cols-[80%_20%] md:grid-rows-1 md:py-2 md:pl-8">
                    <h5 className="text-xl">
                        Detail of: <span className="font-semibold">{proxy.name}</span>
                    </h5>
                    {canBeAddedToActiveView && !isInActiveView && !addToActiveViewButtonClicked && (
                        <button
                            className="w-min text-nowrap"
                            onClick={() => {
                                handleAddEntityToActiveView(entity.id);
                                setAddToActiveViewButtonClicked(true);
                                props.close();
                            }}
                        >
                            add to view
                        </button>
                    )}
                </div>
                <p className="flex flex-row pl-8 text-gray-500" title={proxy.iri ?? ""}>
                    <IriLink iri={proxy.iri} />
                    {proxy.iri}
                </p>

                {/*
                --------------------------------------------
                profiles / generalizations / specializations
                --------------------------------------------
                */}

                <div className="grid md:grid-cols-[20%_80%] md:pl-8">
                    <>
                        {proxy.profileOf && (
                            <DialogDetailRow detailKey={t("entity-detail-dialog.direct-profile")}>
                                <ResourceDetailClickThrough
                                    detailDialogLanguage={language}
                                    resource={proxy.profileOf}
                                    onClick={() => handleResourceClickThroughClicked(proxy.profileOf!)}
                                    withIri={true}
                                />
                            </DialogDetailRow>
                        )}
                        {proxy.originalProfile && proxy.originalProfile.id !== proxy.profileOf?.id && (
                            <DialogDetailRow detailKey={t("entity-detail-dialog.original-profile")}>
                                <ResourceDetailClickThrough
                                    detailDialogLanguage={language}
                                    resource={proxy.originalProfile}
                                    onClick={() => handleResourceClickThroughClicked(proxy.originalProfile!)}
                                    withIri={true}
                                />
                            </DialogDetailRow>
                        )}
                        {proxy.profiledBy.length > 0 && (
                            <DialogDetailRow detailKey={t("entity-detail-dialog.profiled-by")}>
                                <ScrollableResourceDetailClickThroughList
                                    detailDialogLanguage={language}
                                    resources={proxy.profiledBy}
                                    onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                                />
                            </DialogDetailRow>
                        )}
                    </>
                    {proxy.specializationOf.length > 0 && (
                        <DialogDetailRow detailKey={t(isRelationship || isRelationshipProfile ?
                            "entity-detail-dialog.specialization-of-property" :
                            "entity-detail-dialog.specialization-of")}>
                            <ScrollableResourceDetailClickThroughList
                                detailDialogLanguage={language}
                                resources={proxy.specializationOf}
                                onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                            />
                        </DialogDetailRow>
                    )}
                    {proxy.generalizationOf.length > 0 && (
                        <DialogDetailRow detailKey={t("entity-detail-dialog.generalization-of")}>
                            <ScrollableResourceDetailClickThroughList
                                detailDialogLanguage={language}
                                resources={proxy.generalizationOf}
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
                <DialogDetailRow detailKey={t("entity-detail-dialog.type")}>{getEntityTypeString(entity)}</DialogDetailRow>
                <DialogDetailRow detailKey={t("entity-detail-dialog.description")}>{proxy.description}</DialogDetailRow>

                {/*
                ---------------------------------
                attributes and attribute profiles
                ---------------------------------
                */}

                {proxy.attributes.length > 0 && (
                    <DialogDetailRow detailKey={t("entity-detail-dialog.attributes")}>
                        <ScrollableResourceDetailClickThroughList
                            detailDialogLanguage={language}
                            resources={proxy.attributes}
                            onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                        />
                    </DialogDetailRow>
                )}

                {proxy.attributeProfiles.length > 0 && (
                    <DialogDetailRow detailKey={t("entity-detail-dialog.attributes-profiles")}>
                        <ScrollableResourceDetailClickThroughList
                            detailDialogLanguage={language}
                            resources={proxy.attributeProfiles}
                            onResourceClicked={(resource) => handleResourceClickThroughClicked(resource)}
                        />
                    </DialogDetailRow>
                )}
                {proxy.usageNote && <DialogDetailRow detailKey={t("entity-detail-dialog.usage-note")}>
                    {proxy.usageNote}
                </DialogDetailRow>}

                {/*
                ---------------------------------------------
                domain and range for relationships (profiles)
                ---------------------------------------------
                */}

                {proxy.domain.entity && (
                    <DialogDetailRow detailKey={t("entity-detail-dialog.domain")}>
                        <ResourceDetailClickThrough
                            detailDialogLanguage={language}
                            resource={proxy.domain.entity}
                            // it ain't null
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            onClick={() => handleResourceClickThroughClicked(proxy.domain.entity!)}
                            withCardinality={proxy.domain.cardinality}
                        />
                    </DialogDetailRow>
                )}
                {proxy.range.entity && (
                    <DialogDetailRow detailKey={t("entity-detail-dialog.range")}>
                        <ResourceDetailClickThrough
                            resource={proxy.range.entity}
                            detailDialogLanguage={language}
                            // it ain't null
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            onClick={() => handleResourceClickThroughClicked(proxy.range.entity!)}
                            withCardinality={proxy.range.cardinality}
                        />
                    </DialogDetailRow>
                )}
                {proxy.datatype && (
                    <DialogDetailRow detailKey={t("entity-detail-dialog.datatype")}>
                        {proxy.datatype.label ? `${proxy.datatype.label} (${proxy.datatype.uri})` : proxy.datatype.uri}
                    </DialogDetailRow>
                )}
            </div>
        </>
    );
};
