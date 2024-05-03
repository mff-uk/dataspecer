import {
    type SemanticModelClass,
    LanguageString,
    SemanticModelRelationship,
    isSemanticModelRelationship,
    isSemanticModelClass,
    SemanticModelRelationshipEnd,
    isSemanticModelAttribute,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useClassesContext } from "../context/classes-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { getLocalizedStringFromLanguageString, getStringFromLanguageStringInLang } from "../util/language-utils";
import { MultiLanguageInputForLanguageString } from "./multi-language-input-4-language-string";
import { useBaseDialog } from "./base-dialog";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipEndUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { useConfigurationContext } from "../context/configuration-context";
import { getIri, getModelIri } from "../util/model-utils";
import { IriInput } from "./iri-input";
import { AddAttributesComponent } from "./attributes-component";
import { DomainRangeComponent } from "./domain-range-component";
import { createRelationship, deleteEntity, modifyClass } from "@dataspecer/core-v2/semantic-model/operations";
import { createRelationshipUsage, modifyClassUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
import {
    getDescriptionLanguageString,
    getFallbackDisplayName,
    getNameLanguageString,
    getUsageNoteLanguageString,
} from "../util/name-utils";
import { temporaryDomainRangeHelper } from "../util/relationship-utils";
import { getDomainAndRange } from "@dataspecer/core-v2/semantic-model/relationship-utils";
import { isSemanticModelAttributeUsage } from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { OverrideFieldCheckbox } from "./override-field-checkbox";
import { ProfileModificationWarning } from "./profile-modification-warning";

type SupportedTypes =
    | SemanticModelClass
    | SemanticModelClassUsage
    | SemanticModelRelationship
    | SemanticModelRelationshipUsage;

export const useModifyEntityDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [modifiedEntity, setModifiedEntity] = useState(null as unknown as SupportedTypes);
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);

    const { executeMultipleOperations } = useClassesContext();

    const localClose = () => {
        setModifiedEntity(null as unknown as SemanticModelClass);
        setModel(null as unknown as InMemorySemanticModel);
        close();
    };
    const localOpen = (entity: SupportedTypes, model: InMemorySemanticModel | null = null) => {
        if (!model) {
            localClose();
        }
        setModifiedEntity(entity);
        setModel(model);
        open();
    };

    const ModifyEntityDialog = () => {
        const { language: preferredLanguage } = useConfigurationContext();

        const { modifyRelationship, updateEntityUsage } = useModelGraphContext();

        const currentIri = getIri(modifiedEntity);

        const [name2, setName2] = useState(getNameLanguageString(modifiedEntity) ?? {});
        const [description2, setDescription2] = useState(getDescriptionLanguageString(modifiedEntity) ?? {}); // descriptionLanguageString ?? modifiedEntity.description ?? {});
        const [usageNote2, setUsageNote2] = useState<LanguageString>(
            isSemanticModelRelationshipUsage(modifiedEntity) ? modifiedEntity.usageNote ?? {} : {}
        );
        const isProfile = isSemanticModelClassUsage(modifiedEntity) || isSemanticModelRelationshipUsage(modifiedEntity);

        const [newIri, setNewIri] = useState(currentIri ?? undefined);
        const [changedFields, setChangedFields] = useState({
            name: false,
            description: false,
            iri: false,
            usageNote: false,
            domain: false,
            domainCardinality: false,
            range: false,
            rangeCardinality: false,
        });

        const currentDomainAndRange =
            isSemanticModelRelationship(modifiedEntity) || isSemanticModelRelationshipUsage(modifiedEntity)
                ? temporaryDomainRangeHelper(modifiedEntity)
                : null;

        const [newDomain, setNewDomain] = useState(
            currentDomainAndRange?.domain ?? ({} as SemanticModelRelationshipEnd)
        );
        const [newRange, setNewRange] = useState(currentDomainAndRange?.range ?? ({} as SemanticModelRelationshipEnd));

        const modelIri = getModelIri(model);

        // prepare for modifying entities from non-local models. https://github.com/mff-uk/dataspecer/issues/397
        const { models } = useModelGraphContext();

        const { relationships: r, profiles: p } = useClassesContext();
        const attributes = r
            .filter(isSemanticModelAttribute)
            .filter((v) => getDomainAndRange(v)?.domain.concept == modifiedEntity.id);
        const attributeProfiles = p
            .filter(isSemanticModelRelationshipUsage)
            .filter((a) =>
                isSemanticModelAttributeUsage(a as SemanticModelRelationshipUsage & SemanticModelRelationship)
            )
            .filter((v) => temporaryDomainRangeHelper(v)?.domain.concept == modifiedEntity.id);

        const [wantsToAddNewAttributes, setWantsToAddNewAttributes] = useState(false);
        const [newAttributes, setNewAttributes] = useState<Partial<Omit<SemanticModelRelationship, "type">>[]>([]);
        const [newAttributeProfiles, setNewAttributeProfiles] = useState<
            (Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">)[]
        >([]);
        const [toBeRemovedAttributes, setToBeRemovedAttributes] = useState<string[]>([]);

        return (
            <BaseDialog heading="Entity modification">
                <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pl-8 pr-16">
                    <div className="font-semibold">name:</div>
                    <div className="flex flex-row">
                        <div className="flex-grow pb-3 text-xl">
                            <MultiLanguageInputForLanguageString
                                key={name2 + "name-key"}
                                inputType="text"
                                ls={name2}
                                setLs={setName2}
                                defaultLang={preferredLanguage}
                                disabled={isProfile && !changedFields.name}
                                onChange={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                            />
                        </div>
                        {isProfile && (
                            <div className="ml-2">
                                <OverrideFieldCheckbox
                                    forElement="modify-entity-name"
                                    disabled={changedFields.name}
                                    onChecked={() => setChangedFields((prev) => ({ ...prev, name: true }))}
                                />
                            </div>
                        )}
                    </div>

                    {/* 
                    ---------
                    Entity id
                    ---------
                    */}

                    <div className="font-semibold">id:</div>
                    <div>{modifiedEntity.id}</div>

                    {/* 
                    ----------
                    Entity IRI
                    ----------
                    */}

                    {!isProfile && (
                        <>
                            <div className="font-semibold">relative iri:</div>
                            <div className="flex flex-row">
                                <div className="text-nowrap">{modelIri}</div>
                                <IriInput
                                    name={name2}
                                    iriHasChanged={changedFields.iri}
                                    newIri={newIri}
                                    setNewIri={(i) => setNewIri(i)}
                                    onChange={() => setChangedFields((prev) => ({ ...prev, iri: true }))}
                                />
                            </div>
                        </>
                    )}
                    {/* 
                    ------------------
                    Entity description
                    ------------------
                    */}

                    <div className="font-semibold">description:</div>
                    <div className="flex flex-row">
                        <div className="flex-grow">
                            <MultiLanguageInputForLanguageString
                                key={name2 + "description-key"}
                                inputType="textarea"
                                ls={description2}
                                setLs={setDescription2}
                                defaultLang={preferredLanguage}
                                disabled={isProfile && !changedFields.description}
                                onChange={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                            />
                        </div>
                        {isProfile && (
                            <div className="ml-2">
                                <OverrideFieldCheckbox
                                    forElement="modify-entity-description"
                                    disabled={changedFields.description}
                                    onChecked={() => setChangedFields((prev) => ({ ...prev, description: true }))}
                                />
                            </div>
                        )}
                    </div>
                    {isProfile && (
                        <>
                            <div className="font-semibold">usage (profile?) note:</div>
                            <MultiLanguageInputForLanguageString
                                inputType="text"
                                ls={usageNote2}
                                setLs={setUsageNote2}
                                defaultLang={preferredLanguage}
                                onChange={() => setChangedFields((prev) => ({ ...prev, usageNote: true }))}
                            />
                        </>
                    )}

                    {/* 
                    --------------------------------------
                    Attributes for class and class profile
                    --------------------------------------
                    */}

                    {(isSemanticModelClass(modifiedEntity) || isSemanticModelClassUsage(modifiedEntity)) && (
                        <>
                            <div className="font-semibold">attributes:</div>
                            <div className="flex flex-col">
                                <>
                                    {attributes.map((v) => {
                                        const name =
                                            getLocalizedStringFromLanguageString(
                                                getNameLanguageString(v),
                                                preferredLanguage
                                            ) ?? getFallbackDisplayName(v ?? null);
                                        const description = getLocalizedStringFromLanguageString(
                                            getDescriptionLanguageString(v),
                                            preferredLanguage
                                        );

                                        return (
                                            <div
                                                className={`flex flex-row ${
                                                    toBeRemovedAttributes.includes(v.id) ? "line-through" : ""
                                                }`}
                                                title={description ?? ""}
                                            >
                                                {name}
                                                <button
                                                    title="after save removes this entity from the attributes domain"
                                                    onClick={() => {
                                                        setToBeRemovedAttributes((prev) => prev.concat(v.id));
                                                    }}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {newAttributes.map((v) => {
                                        const attr = v.ends?.at(1)!;
                                        const name =
                                            getStringFromLanguageStringInLang(
                                                attr.name ?? v.name ?? {},
                                                preferredLanguage
                                            )[0] ??
                                            v.id ??
                                            "no id or iri";
                                        const descr =
                                            getStringFromLanguageStringInLang(
                                                attr.description ?? v.description ?? {},
                                                preferredLanguage
                                            )[0] ?? "";
                                        return (
                                            <div className="flex flex-row" title={descr}>
                                                (new) {name}
                                                <button
                                                    onClick={() => {
                                                        setNewAttributes((prev) => prev.filter((v1) => v1 != v));
                                                    }}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        );
                                    })}
                                </>
                            </div>
                            <div className="font-semibold">attribute profiles:</div>
                            <div className="flex flex-col">
                                <>
                                    {attributeProfiles.map((v) => {
                                        const name =
                                            getLocalizedStringFromLanguageString(
                                                getNameLanguageString(v),
                                                preferredLanguage
                                            ) ?? getFallbackDisplayName(v ?? null);
                                        const description = getLocalizedStringFromLanguageString(
                                            getDescriptionLanguageString(v),
                                            preferredLanguage
                                        );
                                        const usageNote = getLocalizedStringFromLanguageString(
                                            getUsageNoteLanguageString(v),
                                            preferredLanguage
                                        );

                                        return (
                                            <div
                                                className={`flex flex-row ${
                                                    toBeRemovedAttributes.includes(v.id) ? "line-through" : ""
                                                }`}
                                                title={description ?? ""}
                                            >
                                                {name}
                                                {isSemanticModelRelationshipUsage(v) && usageNote && (
                                                    <div className="ml-1 bg-blue-200" title={usageNote}>
                                                        usage (profile?) note
                                                    </div>
                                                )}
                                                <button
                                                    title="after save removes this entity from the attributes domain"
                                                    onClick={() => {
                                                        setToBeRemovedAttributes((prev) => prev.concat(v.id));
                                                    }}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        );
                                    })}

                                    {newAttributeProfiles.map((v) => {
                                        const attr = v.ends?.at(1)!;
                                        const name =
                                            getStringFromLanguageStringInLang(
                                                attr.name ?? v.name ?? {},
                                                preferredLanguage
                                            )[0] ??
                                            v.id ??
                                            "no id or iri";
                                        const descr =
                                            getStringFromLanguageStringInLang(
                                                attr.description ?? v.description ?? {},
                                                preferredLanguage
                                            )[0] ?? "";
                                        return (
                                            <div className="flex flex-row" title={descr}>
                                                (new) {name}
                                                <button
                                                    onClick={() => {
                                                        setNewAttributes((prev) => prev.filter((v1) => v1 != v));
                                                    }}
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        );
                                    })}
                                </>
                            </div>
                        </>
                    )}

                    {/* 
                    -----------------------------------------------------------
                    Range and domain for a relationship or relationship profile
                    -----------------------------------------------------------
                    */}
                    {(isSemanticModelRelationship(modifiedEntity) ||
                        isSemanticModelRelationshipUsage(modifiedEntity)) && (
                        <>
                            {isProfile &&
                                (changedFields.domain ||
                                    changedFields.range ||
                                    changedFields.domainCardinality ||
                                    changedFields.rangeCardinality) && (
                                    <>
                                        <div />
                                        <ProfileModificationWarning
                                            changedFields={([] as string[])
                                                .concat(changedFields.domain ? "domain" : "")
                                                .concat(changedFields.range ? "range" : "")
                                                .concat(changedFields.domainCardinality ? "domain cardinality" : "")
                                                .concat(changedFields.rangeCardinality ? "range cardinality" : "")
                                                .filter((s) => s.length > 0)}
                                        />
                                    </>
                                )}
                            <DomainRangeComponent
                                enabledFields={changedFields}
                                withCheckEnabling={isProfile}
                                entity={modifiedEntity}
                                range={newRange}
                                setRange={setNewRange}
                                domain={newDomain}
                                setDomain={setNewDomain}
                                onDomainChange={() => setChangedFields((prev) => ({ ...prev, domain: true }))}
                                onDomainCardinalityChange={() =>
                                    setChangedFields((prev) => ({ ...prev, domainCardinality: true }))
                                }
                                onRangeChange={() => setChangedFields((prev) => ({ ...prev, range: true }))}
                                onRangeCardinalityChange={() =>
                                    setChangedFields((prev) => ({ ...prev, rangeCardinality: true }))
                                }
                            />
                        </>
                    )}
                </div>

                {/* 
                -----------------------------------------------------
                Adding new attributes to class or TODO: class profile
                -----------------------------------------------------
                 */}

                {(isSemanticModelClass(modifiedEntity) || isSemanticModelClassUsage(modifiedEntity)) && (
                    <p className="bg-slate-100">
                        <div className="flex flex-row justify-between">
                            <button
                                className="ml-8 bg-slate-300"
                                onClick={() => setWantsToAddNewAttributes((prev) => !prev)}
                            >
                                {wantsToAddNewAttributes ? "cancel" : "add attribute"}
                            </button>
                        </div>
                        <div className="">
                            {wantsToAddNewAttributes && (
                                <AddAttributesComponent
                                    preferredLanguage={preferredLanguage}
                                    sourceModel={model}
                                    modifiedClassId={modifiedEntity.id}
                                    saveNewAttribute={(attribute: Partial<Omit<SemanticModelRelationship, "type">>) => {
                                        setNewAttributes((prev) => prev.concat(attribute));
                                        setWantsToAddNewAttributes(false);
                                    }}
                                    saveNewAttributeProfile={(
                                        attributeProfile: Partial<Omit<SemanticModelRelationshipUsage, "type">> &
                                            Pick<SemanticModelRelationshipUsage, "usageOf">
                                    ) => {
                                        setNewAttributeProfiles((prev) => prev.concat(attributeProfile));
                                        setWantsToAddNewAttributes(false);
                                    }}
                                />
                            )}
                        </div>
                    </p>
                )}

                {/* 
                ----------------------------
                Save and cancel button group
                ----------------------------
                */}

                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    <button
                        disabled={wantsToAddNewAttributes}
                        className=" hover:disabled:cursor-not-allowed"
                        title={wantsToAddNewAttributes ? "first save the attribute or cancel the action" : ""}
                        onClick={() => {
                            console.log(name2, newIri, description2, newAttributes);
                            if (!model) {
                                alert(`model is null`);
                                close();
                                return;
                            }
                            // todo: make it work for other types

                            if (isSemanticModelClass(modifiedEntity) || isSemanticModelClassUsage(modifiedEntity)) {
                                const operations = [];
                                if (isSemanticModelClass(modifiedEntity)) {
                                    let c = {} as Partial<Omit<SemanticModelClass, "type" | "id">>;
                                    c = changedFields.name ? { ...c, name: name2, iri: newIri } : c;
                                    c = changedFields.description ? { ...c, description: description2 } : c;
                                    c = changedFields.iri ? { ...c, iri: newIri } : c;

                                    if (Object.entries(c).length > 0) {
                                        operations.push(modifyClass(modifiedEntity.id, c));
                                    }
                                } else {
                                    let cu = {} as Partial<Omit<SemanticModelClassUsage, "type" | "usageOf">>;
                                    cu = changedFields.name ? { ...cu, name: name2 } : cu;
                                    cu = changedFields.description ? { ...cu, description: description2 } : cu;
                                    cu = changedFields.usageNote ? { ...cu, usageNote: usageNote2 } : cu;

                                    if (Object.entries(cu).length > 0) {
                                        operations.push(modifyClassUsage(modifiedEntity.id, cu));
                                    }
                                }

                                for (const attribute of newAttributes) {
                                    operations.push(createRelationship(attribute));
                                }

                                for (const attributeProfile of newAttributeProfiles) {
                                    operations.push(createRelationshipUsage(attributeProfile));
                                }

                                for (const rem of toBeRemovedAttributes) {
                                    operations.push(deleteEntity(rem));
                                    console.log("todo remove entity from attribute's domain", rem);
                                }
                                executeMultipleOperations(model, operations);
                            } else if (isSemanticModelRelationship(modifiedEntity)) {
                                const domainCard =
                                    newDomain.cardinality != currentDomainAndRange?.domain?.cardinality
                                        ? newDomain.cardinality
                                        : currentDomainAndRange?.domain?.cardinality;
                                const rangeCard =
                                    newRange.cardinality != currentDomainAndRange?.range?.cardinality
                                        ? newRange.cardinality
                                        : currentDomainAndRange?.range?.cardinality;

                                const domainEnd = {
                                    ...currentDomainAndRange!.domain,
                                    concept: newDomain.concept ?? currentDomainAndRange?.domain.concept ?? null,
                                    cardinality: domainCard,
                                } as SemanticModelRelationshipEnd;
                                const rangeEnd = {
                                    ...currentDomainAndRange!.range,
                                    concept: newRange.concept ?? currentDomainAndRange?.range.concept ?? null,
                                    name: name2,
                                    iri: newIri ?? null,
                                    description: description2,
                                    cardinality: rangeCard,
                                } as SemanticModelRelationshipEnd;

                                let ends: SemanticModelRelationshipEnd[];
                                if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
                                    ends = [rangeEnd, domainEnd];
                                } else {
                                    ends = [domainEnd, rangeEnd];
                                }

                                const result = modifyRelationship(model, modifiedEntity.id, {
                                    ends,
                                });
                                console.log(result);
                            } else if (isSemanticModelRelationshipUsage(modifiedEntity)) {
                                const domainEnd = {
                                    concept: changedFields.domain ? newDomain.concept : null,
                                    name: null,
                                    description: null,
                                    cardinality: changedFields.domain ? newDomain.cardinality : null,
                                    usageNote: null,
                                } as SemanticModelRelationshipEndUsage;
                                const rangeEnd = {
                                    concept: changedFields.range ? newRange.concept : null,
                                    name: changedFields.name ? name2 : null,
                                    description: changedFields.description ? description2 : null,
                                    cardinality: changedFields.range ? newRange.cardinality : null,
                                    usageNote: changedFields.usageNote ? usageNote2 : null,
                                } as SemanticModelRelationshipEndUsage;

                                let ends: SemanticModelRelationshipEndUsage[];
                                if (currentDomainAndRange?.domainIndex == 1 && currentDomainAndRange.rangeIndex == 0) {
                                    ends = [rangeEnd, domainEnd];
                                } else {
                                    ends = [domainEnd, rangeEnd];
                                }

                                const res = updateEntityUsage(model, "relationship-usage", modifiedEntity.id, {
                                    usageNote: changedFields.usageNote ? usageNote2 : null,
                                    ends,
                                });
                                console.log(
                                    res,
                                    "relationship profile updated",
                                    usageNote2,
                                    description2,
                                    name2,
                                    newRange,
                                    newDomain
                                );
                            }

                            close();
                        }}
                    >
                        save
                    </button>
                    <button onClick={close}>close</button>
                </div>
            </BaseDialog>
        );
    };

    return {
        isModifyEntityDialogOpen: isOpen,
        closeModifyEntityDialog: localClose,
        openModifyEntityDialog: localOpen,
        ModifyEntityDialog,
    };
};
