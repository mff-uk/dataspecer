import {
    isSemanticModelClass,
    isSemanticModelRelationship,
    SemanticModelGeneralization,
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelGeneralization,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { cardinalityToString, isAttribute } from "../util/utils";
import { useClassesContext } from "../context/classes-context";
import {
    getLanguagesForNamedThing,
    getNameOrIriAndDescription,
    getStringFromLanguageStringInLang,
} from "../util/language-utils";
import { IriLink } from "../catalog/entity-catalog-row";
import {
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useBaseDialog } from "./base-dialog";
import { getIri, getModelIri } from "../util/model-utils";
import { useConfigurationContext } from "../context/configuration-context";
import { useModelGraphContext } from "../context/model-context";

type SupportedEntityType =
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassUsage
    | SemanticModelRelationshipUsage
    | SemanticModelGeneralization;

export const useEntityDetailDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const editDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [viewedEntity, setViewedEntity] = useState(null as unknown as SupportedEntityType);

    useEffect(() => {
        const { current: el } = editDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const localClose = () => {
        setViewedEntity(null as unknown as SupportedEntityType);
        close();
    };
    const localOpen = (entity: SupportedEntityType) => {
        setViewedEntity(entity);
        open();
    };
    const save = () => {
        close();
    };

    const EntityDetailDialog = () => {
        const { language: preferredLanguage } = useConfigurationContext();
        const [currentLang, setCurrentLang] = useState(preferredLanguage);

        const langs = isSemanticModelGeneralization(viewedEntity) ? [] : getLanguagesForNamedThing(viewedEntity);

        const { classes2: c, attributes: a, profiles, sourceModelOfEntityMap } = useClassesContext();
        const { models } = useModelGraphContext();
        const sourceModelId = sourceModelOfEntityMap.get(viewedEntity.id);
        const sourceModel = models.get(sourceModelId ?? "");

        let name = "",
            description = "",
            iri: null | string = null,
            modelIri: null | string = getModelIri(sourceModel),
            usageNote: null | string = null,
            profileOf: null | string = null,
            profiledBy: string[] = [];

        if (isSemanticModelClassUsage(viewedEntity) || isSemanticModelRelationshipUsage(viewedEntity)) {
            const [a, b] = getStringFromLanguageStringInLang(viewedEntity.name ?? {}, currentLang);
            const [c, d] = getStringFromLanguageStringInLang(viewedEntity.description ?? {}, currentLang);
            const [e, f] = getStringFromLanguageStringInLang(viewedEntity.usageNote ?? {}, currentLang);
            [name, description, usageNote, profileOf] = [
                (a ?? "no-name") + (b != null ? `@${b}` : ""),
                c ?? "" + (d != null ? `@${d}` : ""),
                e ?? "" + (f != null ? `@${f}` : ""),
                viewedEntity.usageOf,
            ];
        } else if (isSemanticModelClass(viewedEntity) || isSemanticModelRelationship(viewedEntity)) {
            const [a, b] = getNameOrIriAndDescription(viewedEntity, viewedEntity.iri || viewedEntity.id, currentLang);
            [name, description, iri] = [a ?? "no-iri", b ?? "", viewedEntity.iri];
        }

        const attributes = a.filter((v) => v.ends.at(0)?.concept == viewedEntity.id);
        const attributeProfiles = profiles
            .filter(isSemanticModelRelationshipUsage)
            .filter((v) => v.ends.at(0)?.concept == viewedEntity.id);

        profiledBy = profiles.filter((p) => p.usageOf == viewedEntity.id).map((p) => p.id);

        const ends =
            isSemanticModelRelationship(viewedEntity) || isSemanticModelRelationshipUsage(viewedEntity)
                ? viewedEntity.ends
                : null;
        const domain =
            c.find((cls) => cls.id == ends?.at(0)?.concept) ?? profiles.find((v) => v.id == ends?.at(0)?.concept);
        const domainCardinality = cardinalityToString(ends?.at(0)?.cardinality);
        const domainIri = getIri(domain ?? null);
        const range =
            c.find((cls) => cls.id == ends?.at(1)?.concept) ?? profiles.find((v) => v.id == ends?.at(0)?.concept);
        const rangeCardinality = cardinalityToString(ends?.at(1)?.cardinality);
        const rangeIri = getIri(range ?? null);

        console.log(ends, domain, viewedEntity);

        return (
            <BaseDialog heading="Entity detail">
                <div className="bg-slate-100">
                    <h5>
                        Detail of: <span className="font-semibold">{name}</span>
                    </h5>
                    <div className="grid grid-cols-[80%_20%] grid-rows-1">
                        <p className="flex flex-row text-gray-500" title={iri ?? ""}>
                            <IriLink iri={modelIri + iri} />
                            {modelIri + iri}
                        </p>

                        <div>
                            lang:
                            <select
                                name="langs"
                                id="langs"
                                onChange={(e) => setCurrentLang(e.target.value)}
                                defaultValue={currentLang}
                            >
                                {langs.map((lang) => (
                                    <option value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            {profileOf && <div className="flex flex-row text-gray-500">profile of: {profileOf}</div>}
                            {profiledBy.length > 0 && (
                                <div className="flex flex-row text-gray-500">profiled by: {profiledBy.join(", ")}</div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-[20%_80%] gap-y-3 bg-slate-100">
                    <div className="font-semibold">type:</div>
                    <div>
                        {viewedEntity.type}
                        {(isSemanticModelRelationship(viewedEntity) ||
                            isSemanticModelRelationshipUsage(viewedEntity)) &&
                        isAttribute(viewedEntity)
                            ? " (attribute)"
                            : ""}
                    </div>
                    <div className="font-semibold">description:</div>
                    <div> {description}</div>
                    {attributes.length > 0 && (
                        <>
                            <div className="font-semibold">attributes:</div>
                            <div>
                                {attributes.map((v) => {
                                    const attr = v.ends.at(1)!;
                                    const [name, fallbackLang] = getStringFromLanguageStringInLang(
                                        attr.name,
                                        currentLang
                                    );
                                    const [attributeDescription, fallbackAttributeDescriptionLang] =
                                        getStringFromLanguageStringInLang(attr.description);

                                    let descr = "";
                                    if (attributeDescription && !fallbackAttributeDescriptionLang) {
                                        descr = attributeDescription;
                                    } else if (attributeDescription && fallbackAttributeDescriptionLang) {
                                        descr = `${attributeDescription}@${fallbackAttributeDescriptionLang}`;
                                    }

                                    return (
                                        <div title={descr}>
                                            {name}@{fallbackLang}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {attributeProfiles.length > 0 && (
                        <>
                            <div className="font-semibold">attribute profiles:</div>
                            <div>
                                {attributeProfiles.map((v) => {
                                    const attr = v.ends.at(1)!;
                                    const [name, fallbackLang] = getStringFromLanguageStringInLang(
                                        attr.name ?? {},
                                        currentLang
                                    );
                                    const [attributeDescription, fallbackAttributeDescriptionLang] =
                                        getStringFromLanguageStringInLang(attr.description ?? {}, currentLang);

                                    let descr = "";
                                    if (attributeDescription && !fallbackAttributeDescriptionLang) {
                                        descr = attributeDescription;
                                    } else if (attributeDescription && fallbackAttributeDescriptionLang) {
                                        descr = `${attributeDescription}@${fallbackAttributeDescriptionLang}`;
                                    }

                                    const usageNote =
                                        getStringFromLanguageStringInLang(v.usageNote ?? {}, currentLang)[0] ??
                                        "no usage note";

                                    return (
                                        <div title={descr}>
                                            {name ?? v.id}@{fallbackLang}
                                            <span className="ml-2 bg-blue-200" title={usageNote}>
                                                usage note
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    {usageNote && (
                        <>
                            <div className="font-semibold">usage note:</div>
                            <div>{usageNote}</div>
                        </>
                    )}
                    {domain && (
                        <>
                            <div className="font-semibold">domain: </div>
                            <div>
                                {getStringFromLanguageStringInLang(domain.name ?? {}, currentLang) ??
                                    domainIri ??
                                    domain.id}
                                :{domainCardinality}
                            </div>
                        </>
                    )}
                    {range && (
                        <>
                            <div className="font-semibold">range: </div>

                            <div>
                                {getStringFromLanguageStringInLang(range.name ?? {}, currentLang) ??
                                    rangeIri ??
                                    range.id}
                                :{rangeCardinality}
                            </div>
                        </>
                    )}
                </div>
                <p className="bg-slate-100">
                    domain: {domain ? "present" : "null"}, range: {range ? "present" : "null"}
                </p>
                <div className="flex flex-row justify-evenly">
                    <button onClick={save}>confirm</button>
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
