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
import { EntityModel } from "@dataspecer/core-v2/entity-model";
import { getLocalizedStringFromLanguageString, getStringFromLanguageStringInLang } from "../util/language-utils";
import { MultiLanguageInputForLanguageString } from "./multi-language-input-4-language-string";
import { useBaseDialog } from "./base-dialog";
import {
    SemanticModelClassUsage,
    SemanticModelRelationshipUsage,
    isSemanticModelClassUsage,
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { isAttribute } from "../util/utils";
import { useConfigurationContext } from "../context/configuration-context";
import { getIri, getModelIri } from "../util/model-utils";
import { IriInput } from "./iri-input";
import { AddAttributesComponent } from "./attributes-component";
import { DomainRangeComponent } from "./domain-range-component";
import { createRelationship, deleteEntity, modifyClass } from "@dataspecer/core-v2/semantic-model/operations";
import { createRelationshipUsage, modifyClassUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";
import { getDescriptionLanguageString, getNameLanguageString, getUsageNoteLanguageString } from "../util/name-utils";

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

    const filterInMemoryModels = (models: Map<string, EntityModel>) => {
        return [...models.entries()].filter(([mId, m]) => m instanceof InMemorySemanticModel).map(([mId, _]) => mId);
    };

    const ModifyEntityDialog = () => {
        const { language: preferredLanguage } = useConfigurationContext();

        const { classes2: classes } = useClassesContext();
        const {
            modifyClassInAModel,
            modifyRelationship,
            createRelationshipEntityUsage,
            updateEntityUsage,
            updateClassUsage,
        } = useModelGraphContext();

        const currentIri = getIri(modifiedEntity);

        const [name2, setName2] = useState(getNameLanguageString(modifiedEntity) ?? {});
        const [description2, setDescription2] = useState(getDescriptionLanguageString(modifiedEntity) ?? {}); // descriptionLanguageString ?? modifiedEntity.description ?? {});
        const [usageNote2, setUsageNote2] = useState<LanguageString>(
            isSemanticModelRelationshipUsage(modifiedEntity) ? modifiedEntity.usageNote ?? {} : {}
        );

        const [newIri, setNewIri] = useState(
            currentIri ?? undefined // ?? name2[preferredLanguage]?.toLowerCase().replace(WhitespaceRegExp, "-")
        );
        const [iriHasChanged, setIriHasChanged] = useState(false);

        const [currentRange, currentDomain] =
            isSemanticModelRelationship(modifiedEntity) || isSemanticModelRelationshipUsage(modifiedEntity)
                ? /* TODO: redo this after domain/range is ready for profiles */
                  // isSemanticModelRelationship(modifiedEntity) ? [getDomainAndRange(modifiedEntity)?.range, getDomainAndRange(modifiedEntity)?.domain ]:

                  (modifiedEntity.ends as SemanticModelRelationshipEnd[])
                : // TODO: tohle bys mohl predelat
                  [null, null];

        const [newRange, setNewRange] = useState(currentRange ?? ({} as SemanticModelRelationshipEnd));
        const [newDomain, setNewDomain] = useState(currentDomain ?? ({} as SemanticModelRelationshipEnd));

        const modelIri = getModelIri(model);

        // prepare for modifying entities from non-local models. https://github.com/mff-uk/dataspecer/issues/397
        const { models } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels(models);

        const { relationships: r, /* attributes: a, */ deleteEntityFromModel, profiles: p } = useClassesContext();
        const attributes = r.filter(isSemanticModelAttribute).filter((v) => v.ends.at(0)?.concept == modifiedEntity.id);
        const attributeProfiles = p
            .filter(isSemanticModelRelationshipUsage)
            .filter(isAttribute)
            .filter((v) => v.ends.at(0)?.concept == modifiedEntity.id);

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
                    <div className="pb-3 text-xl">
                        <MultiLanguageInputForLanguageString
                            key={name2 + "name-key"}
                            inputType="text"
                            ls={name2}
                            setLs={setName2}
                            defaultLang={preferredLanguage}
                        />
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

                    <div className="font-semibold">relative iri:</div>
                    <div className="flex flex-row">
                        <div className="text-nowrap">{modelIri}</div>
                        <IriInput
                            name={name2}
                            iriHasChanged={iriHasChanged}
                            newIri={newIri}
                            setIriHasChanged={(v) => setIriHasChanged(v)}
                            setNewIri={(i) => setNewIri(i)}
                        />
                    </div>

                    {/* 
                    ------------------
                    Entity description
                    ------------------
                    */}

                    <div className="font-semibold">description:</div>
                    <MultiLanguageInputForLanguageString
                        key={name2 + "description-key"}
                        inputType="textarea"
                        ls={description2}
                        setLs={setDescription2}
                        defaultLang={preferredLanguage}
                    />
                    {isSemanticModelRelationshipUsage(modifiedEntity) && (
                        <>
                            <div className="font-semibold">usage (profile?) note:</div>
                            <MultiLanguageInputForLanguageString
                                inputType="text"
                                ls={usageNote2}
                                setLs={setUsageNote2}
                                defaultLang={preferredLanguage}
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
                                    {[...attributes, ...attributeProfiles].map((v) => {
                                        const name = getLocalizedStringFromLanguageString(
                                            getNameLanguageString(v),
                                            preferredLanguage
                                        );
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

                                    {[...newAttributes, ...newAttributeProfiles].map((v) => {
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
                                                {name}
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
                        <DomainRangeComponent
                            entity={modifiedEntity}
                            range={newRange}
                            setRange={setNewRange}
                            domain={newDomain}
                            setDomain={setNewDomain}
                        />
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

                <div className="flex flex-row justify-evenly">
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
                            let result = false;

                            if (isSemanticModelClass(modifiedEntity) || isSemanticModelClassUsage(modifiedEntity)) {
                                const operations = [];
                                if (isSemanticModelClass(modifiedEntity)) {
                                    operations.push(
                                        modifyClass(modifiedEntity.id, {
                                            name: name2,
                                            iri: newIri,
                                            description: description2,
                                        })
                                    );
                                } else {
                                    operations.push(
                                        modifyClassUsage(modifiedEntity.id, {
                                            name: name2,
                                            description: description2,
                                            usageNote: usageNote2,
                                        })
                                    );
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
                                const rangeCard =
                                    newRange.cardinality != currentRange?.cardinality
                                        ? newRange.cardinality
                                        : currentRange?.cardinality;
                                const domainCard =
                                    newDomain.cardinality != currentDomain?.cardinality
                                        ? newDomain.cardinality
                                        : currentDomain?.cardinality;

                                const result = modifyRelationship(model, modifiedEntity.id, {
                                    ...modifiedEntity,
                                    ends: [
                                        {
                                            ...modifiedEntity.ends.at(0)!,
                                            concept: newRange.concept ?? currentRange?.concept ?? "",
                                            cardinality: rangeCard,
                                        },
                                        {
                                            ...modifiedEntity.ends.at(1)!,
                                            concept: newDomain.concept ?? currentDomain?.concept ?? "",
                                            cardinality: domainCard,
                                            iri: newIri ?? null,
                                            name: name2,
                                            description: description2,
                                        },
                                    ], // if there is a change with `ends`, change it. Otherwise leave it as is
                                    // name: name2,
                                    // iri: newIri,
                                    // description: description2,
                                });
                                console.log(result);
                            } else if (isSemanticModelRelationshipUsage(modifiedEntity)) {
                                // todo

                                const rangeCard =
                                    newRange.cardinality != currentRange?.cardinality
                                        ? newRange.cardinality
                                        : currentRange?.cardinality;
                                const domainCard =
                                    newDomain.cardinality != currentDomain?.cardinality
                                        ? newDomain.cardinality
                                        : currentDomain?.cardinality;

                                const res = updateEntityUsage(model, "relationship-usage", modifiedEntity.id, {
                                    name: name2,
                                    description: description2,
                                    usageNote: usageNote2,
                                    ends: [
                                        {
                                            ...modifiedEntity.ends.at(0)!,
                                            concept: newRange.concept ?? currentRange?.concept ?? "",
                                            cardinality: rangeCard ?? null,
                                        },
                                        {
                                            ...modifiedEntity.ends.at(1)!,
                                            concept: newDomain.concept ?? currentDomain?.concept ?? "",
                                            cardinality: domainCard ?? null,
                                        },
                                    ], // if there is a change with `ends`, change it. Otherwise leave it as is
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
