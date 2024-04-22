import {
    isSemanticModelRelationship,
    SemanticModelGeneralization,
    type SemanticModelClass,
    type SemanticModelRelationship,
    isSemanticModelGeneralization,
    isSemanticModelAttribute,
    SemanticModelRelationshipEnd,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { cardinalityToString } from "../util/utils";
import { useClassesContext } from "../context/classes-context";
import { getLanguagesForNamedThing, getLocalizedStringFromLanguageString } from "../util/language-utils";
import { IriLink } from "../catalog/entity-catalog-row";
import {
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useBaseDialog } from "./base-dialog";
import { getIri, getModelIri, sourceModelOfEntity } from "../util/model-utils";
import { useConfigurationContext } from "../context/configuration-context";
import { useModelGraphContext } from "../context/model-context";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import {
    getDescriptionLanguageString,
    getFallbackDisplayName,
    getNameLanguageString,
    getUsageNoteLanguageString,
} from "../util/name-utils";
import { temporaryDomainRangeHelper } from "../util/relationship-utils";
import { isSemanticModelAttributeUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";

type SupportedEntityType =
    | SemanticModelClass
    | SemanticModelRelationship
    | SemanticModelClassUsage
    | SemanticModelRelationshipUsage
    | SemanticModelGeneralization;

export const useEntityDetailDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const editDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [viewedEntity2, setViewedEntity2] = useState(null as unknown as SupportedEntityType);

    useEffect(() => {
        const { current: el } = editDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const localClose = () => {
        setViewedEntity2(null as unknown as SupportedEntityType);
        close();
    };
    const localOpen = (entity: SupportedEntityType) => {
        setViewedEntity2(entity);
        open();
    };
    const save = () => {
        close();
    };

    const EntityDetailDialog = () => {
        const { language: preferredLanguage } = useConfigurationContext();
        const [currentLang, setCurrentLang] = useState(preferredLanguage);
        const [viewedEntity, setViewedEntity] = useState(viewedEntity2);

        const langs = isSemanticModelGeneralization(viewedEntity) ? [] : getLanguagesForNamedThing(viewedEntity);

        const { classes2: c, relationships: r, profiles, generalizations } = useClassesContext();
        const { models } = useModelGraphContext();
        const sourceModel = sourceModelOfEntity(viewedEntity.id, [...models.values()]);

        const modelIri = getModelIri(sourceModel);

        const name =
            getLocalizedStringFromLanguageString(getNameLanguageString(viewedEntity), currentLang) ??
            getFallbackDisplayName(viewedEntity);
        const description = getLocalizedStringFromLanguageString(
            getDescriptionLanguageString(viewedEntity),
            currentLang
        );
        const usageNote = getLocalizedStringFromLanguageString(getUsageNoteLanguageString(viewedEntity), currentLang);
        const iri = getIri(viewedEntity);

        const specializationOf = generalizations
            .filter((g) => g.child == viewedEntity.id)
            .map((g) => c.find((cl) => cl.id == g.parent))
            .filter((cl) => isSemanticModelClass(cl ?? null))
            .map((cl) => {
                if (cl) {
                    return (
                        <li onClick={() => setViewedEntity(cl)} className="cursor-pointer hover:underline">
                            {getLocalizedStringFromLanguageString(getNameLanguageString(cl ?? null), currentLang) ??
                                getFallbackDisplayName(cl ?? null)}
                        </li>
                    );
                }
            })
            .filter((e): e is JSX.Element => {
                return e != undefined;
            });
        // .map(
        //     (cl) =>
        //         getLocalizedStringFromLanguageString(cl?.name ?? {}, currentLang) ??
        //         getFallbackDisplayName(cl ?? null)
        // )
        // .join(", ");
        const generalizationOf = generalizations
            .filter((g) => g.parent == viewedEntity.id)
            .map((g) => c.find((cl) => cl.id == g.child))
            .filter((cl) => isSemanticModelClass(cl ?? null))
            .map((cl) => {
                if (cl) {
                    return (
                        <li onClick={() => setViewedEntity(cl)} className="cursor-pointer hover:underline">
                            {getLocalizedStringFromLanguageString(getNameLanguageString(cl ?? null), currentLang) ??
                                getFallbackDisplayName(cl ?? null)}
                        </li>
                    );
                }
            })
            .filter((e): e is JSX.Element => {
                return e != undefined;
            });
        // .map(
        //     (cl) =>
        //         getLocalizedStringFromLanguageString(cl?.name ?? {}, currentLang) ??
        //         getFallbackDisplayName(cl ?? null)
        // )
        // .join(", ");

        const isProfileOf =
            isSemanticModelClassUsage(viewedEntity) || isSemanticModelRelationshipUsage(viewedEntity)
                ? profiles
                      .filter((p) => p.id == viewedEntity.id)
                      .map((p) => [...c, ...r, ...profiles].find((e) => e.id == p.usageOf))
                      .map((e) => {
                          if (e) {
                              return (
                                  <li onClick={() => setViewedEntity(e)} className="cursor-pointer hover:underline">
                                      {getLocalizedStringFromLanguageString(
                                          getNameLanguageString(e ?? null),
                                          currentLang
                                      ) ?? getFallbackDisplayName(e ?? null)}
                                  </li>
                              );
                          }
                      })
                      .filter((e): e is JSX.Element => {
                          return e != undefined;
                      })
                : [];

        const isProfiledBy = profiles
            .filter((p) => p.usageOf == viewedEntity.id)
            .map((p) => [...c, ...r, ...profiles].find((e) => e.id == p.id))
            .map((e) => {
                if (e) {
                    return (
                        <li onClick={() => setViewedEntity(e)} className="cursor-pointer hover:underline">
                            {getLocalizedStringFromLanguageString(getNameLanguageString(e ?? null), currentLang) ??
                                getFallbackDisplayName(e ?? null)}
                        </li>
                    );
                }
            })
            .filter((e): e is JSX.Element => {
                return e != undefined;
            });
        // .map(
        //     (e) =>
        //         getLocalizedStringFromLanguageString(getNameLanguageString(e ?? null), currentLang) ??
        //         getFallbackDisplayName(e ?? null)
        // )
        // .join(", ");

        const attributes = /* a */ r
            .filter(isSemanticModelAttribute)
            .filter((v) => v.ends.at(0)?.concept == viewedEntity.id);
        const attributeProfiles = profiles
            .filter(isSemanticModelRelationshipUsage)
            .filter((a) =>
                isSemanticModelAttributeUsage(a as SemanticModelRelationshipUsage & SemanticModelRelationship)
            )
            .filter((v) => temporaryDomainRangeHelper(v)?.domain.concept == viewedEntity.id);

        let ends: { domain: SemanticModelRelationshipEnd; range: SemanticModelRelationshipEnd } | null = null;
        if (isSemanticModelRelationship(viewedEntity)) {
            ends = getDomainAndRange(viewedEntity);
        } else if (isSemanticModelRelationshipUsage(viewedEntity)) {
            ends = temporaryDomainRangeHelper(viewedEntity);
        } else if (isSemanticModelGeneralization(viewedEntity)) {
            ends = {
                domain: {
                    concept: viewedEntity.child,
                    name: { en: "Generalization child" },
                    description: {},
                    iri: null,
                } as SemanticModelRelationshipEnd,
                range: {
                    concept: viewedEntity.parent,
                    name: { en: "Generalization parent" },
                    description: {},
                    iri: null,
                } as SemanticModelRelationshipEnd,
            };
        }

        const range =
            c.find((cls) => cls.id == ends?.range.concept) ?? profiles.find((v) => v.id == ends?.range?.concept);
        const rangeCardinality = cardinalityToString(ends?.range?.cardinality);

        const domain =
            c.find((cls) => cls.id == ends?.domain?.concept) ?? profiles.find((v) => v.id == ends?.domain?.concept);
        const domainCardinality = cardinalityToString(ends?.domain?.cardinality);

        console.log(viewedEntity, ends);

        return (
            <BaseDialog
                heading={`${
                    viewedEntity.type[0].charAt(0).toUpperCase() +
                    viewedEntity.type[0].slice(1).replace("-", " ").replace("usage", "profile")
                } detail`}
            >
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
                            {isProfileOf.length > 0 && (
                                <div className="flex flex-row text-gray-500">
                                    <span className="mr-2 font-semibold">profile of:</span>
                                    <ul className="flex list-none flex-row [&>li]:mx-1">{isProfileOf}</ul>
                                </div>
                            )}
                            {isProfiledBy.length > 0 && (
                                <div className="flex flex-row text-gray-500">
                                    <span className="mr-2 font-semibold">profiled by:</span>
                                    <ul className="flex list-none flex-row [&>li]:mx-1">{isProfiledBy}</ul>
                                </div>
                            )}
                        </div>

                        <div />

                        <div>
                            {specializationOf.length > 0 && (
                                <div className="flex flex-row text-gray-500">
                                    <span className="mr-2 font-semibold">specialization of:</span>
                                    <ul className="flex list-none flex-row [&>li]:mx-1">{specializationOf}</ul>
                                </div>
                            )}
                            {generalizationOf.length > 0 && (
                                <div className="flex flex-row text-gray-500">
                                    <span className="mr-2 font-semibold">generalization of:</span>
                                    <ul className="flex list-none flex-row [&>li]:mx-1">{generalizationOf}</ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-[20%_80%] gap-y-3 bg-slate-100">
                    <div className="font-semibold">type:</div>
                    <div>
                        {viewedEntity.type}
                        {isSemanticModelAttribute(viewedEntity) || isSemanticModelAttributeUsage(viewedEntity)
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
                                    const name =
                                        getLocalizedStringFromLanguageString(
                                            getNameLanguageString(v),
                                            preferredLanguage
                                        ) ??
                                        v.ends.at(0)?.iri ??
                                        v.id;
                                    const descr = getLocalizedStringFromLanguageString(
                                        getDescriptionLanguageString(v),
                                        preferredLanguage
                                    );

                                    return <div title={descr ?? ""}>{name}</div>;
                                })}
                            </div>
                        </>
                    )}

                    {attributeProfiles.length > 0 && (
                        <>
                            <div className="font-semibold">attribute profiles:</div>
                            <div>
                                {attributeProfiles.map((v) => {
                                    const name =
                                        getLocalizedStringFromLanguageString(
                                            getNameLanguageString(v),
                                            preferredLanguage
                                        ) ?? getFallbackDisplayName(v ?? null);
                                    const descr = getLocalizedStringFromLanguageString(
                                        getDescriptionLanguageString(v),
                                        preferredLanguage
                                    );
                                    const usageNote = getLocalizedStringFromLanguageString(
                                        getUsageNoteLanguageString(v),
                                        preferredLanguage
                                    );

                                    return (
                                        <div title={descr ?? ""}>
                                            {name}
                                            {usageNote && (
                                                <span className="ml-2 bg-blue-200" title={usageNote}>
                                                    usage note
                                                </span>
                                            )}
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
                                {getLocalizedStringFromLanguageString(
                                    getNameLanguageString(domain),
                                    preferredLanguage
                                ) ?? getFallbackDisplayName(domain)}
                                :{domainCardinality}
                            </div>
                        </>
                    )}
                    {range && (
                        <>
                            <div className="font-semibold">range: </div>

                            <div>
                                {getLocalizedStringFromLanguageString(
                                    getNameLanguageString(range),
                                    preferredLanguage
                                ) ?? getFallbackDisplayName(range)}
                                :{rangeCardinality}
                            </div>
                        </>
                    )}
                </div>
                <p className="bg-slate-100">
                    range: {range ? "present" : "null"}, domain: {domain ? "present" : "null"},
                </p>
                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    {/* <button onClick={save}>confirm</button> */}
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
