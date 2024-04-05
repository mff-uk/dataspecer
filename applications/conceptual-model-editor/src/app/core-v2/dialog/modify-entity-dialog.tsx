import {
    type SemanticModelClass,
    LanguageString,
    SemanticModelRelationship,
    isSemanticModelRelationship,
    isSemanticModelClass,
    SemanticModelRelationshipEnd,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useEffect, useState } from "react";
import { useModelGraphContext } from "../context/model-context";
import { useClassesContext } from "../context/classes-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { EntityModel } from "@dataspecer/core-v2/entity-model";
import {
    getAvailableLanguagesForLanguageString,
    getNameOrIriAndDescription,
    getStringFromLanguageStringInLang,
} from "../util/language-utils";
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
import { getModelIri } from "../util/model-utils";
import { getRandomName } from "~/app/utils/random-gen";
import { IriInput, WhitespaceRegExp } from "./iri-input";

const AddAttributesComponent = (props: {
    modifiedClassId: string;
    saveNewAttribute: (attr: Partial<Omit<SemanticModelRelationship, "type">>) => void;
    saveNewAttributeProfile: (
        attr: Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">
    ) => void;
}) => {
    const [newAttribute, setNewAttribute] = useState<Partial<Omit<SemanticModelRelationship, "type">>>({});
    const [name, setName] = useState({} as LanguageString);
    const [description, setDescription] = useState({} as LanguageString);
    const [cardinality, setCardinality] = useState("");
    const [iri, setIri] = useState(getRandomName(7)); // todo
    const { relationships } = useClassesContext();
    const [newAttributeIsProfileOf, setNewAttributeIsProfileOf] = useState<string | null>(null);

    useEffect(() => {
        setNewAttribute({
            iri,
            ends: [
                { cardinality: [0, null], name: {}, description: {}, concept: props.modifiedClassId },
                {
                    cardinality: [0, null], // TODO: cardinality
                    name,
                    description,
                    // @ts-ignore
                    concept: null,
                },
            ],
        });
    }, [name, description, cardinality, iri]);

    return (
        <div>
            <span className="text-xs italic">It is possible to add only one attribute rn.</span>
            <div className="grid grid-cols-[25%_75%] gap-y-3 bg-slate-100 pl-8 pr-16">
                <div className="font-semibold">name:</div>
                <div>
                    <MultiLanguageInputForLanguageString
                        inputType="text"
                        ls={name}
                        setLs={setName}
                        defaultLang={getAvailableLanguagesForLanguageString(name)[0] ?? "en"}
                    />
                </div>
                <div className="font-semibold">description:</div>
                <div>
                    <MultiLanguageInputForLanguageString
                        inputType="text"
                        ls={description}
                        setLs={setDescription}
                        defaultLang={getAvailableLanguagesForLanguageString(description)[0] ?? "en"}
                    />
                </div>
                <div>is profile of:</div>
                <select
                    onChange={(e) => {
                        setNewAttributeIsProfileOf(e.target.value);
                    }}
                >
                    <option>---</option>
                    {relationships.filter(isAttribute).map((a) => {
                        const [name, descr] = getNameOrIriAndDescription(a.ends.at(1), a.iri || a.id);
                        return (
                            <option title={descr ?? ""} value={a.id}>
                                {name}:{a.id}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className="flex flex-row justify-center">
                <button
                    onClick={() => {
                        if (newAttributeIsProfileOf) {
                            console.log("profile selected", newAttributeIsProfileOf);
                            props.saveNewAttributeProfile({
                                usageOf: newAttributeIsProfileOf,
                                name,
                                description,
                                // ends: TODO az bude jasne, jestli maji byt konce taky ..shipEndUsage nebo jen ..shipEnd
                                ends: [
                                    {
                                        cardinality: [0, null],
                                        name: {},
                                        description: {},
                                        concept: props.modifiedClassId,
                                        usageNote: {},
                                    },
                                    {
                                        cardinality: [0, null], // TODO: cardinality
                                        name,
                                        description,
                                        // @ts-ignore
                                        concept: null,
                                        usageNote: {},
                                    },
                                ],
                            });
                        } else {
                            props.saveNewAttribute(newAttribute);
                        }
                    }}
                >
                    save
                </button>
            </div>
        </div>
    );
};

type SupportedTypes =
    | SemanticModelClass
    | SemanticModelClassUsage
    | SemanticModelRelationship
    | SemanticModelRelationshipUsage;

export const useModifyEntityDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const [modifiedEntity, setModifiedEntity] = useState(null as unknown as SupportedTypes);
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);

    const { addAttribute } = useClassesContext();

    const localClose = () => {
        setModifiedEntity(null as unknown as SemanticModelClass);
        setModel(null as unknown as InMemorySemanticModel);
        close();
    };
    const localOpen = (entity: SupportedTypes, model: InMemorySemanticModel | null = null) => {
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
        const [name2, setName2] = useState(modifiedEntity.name ?? {});
        const [description2, setDescription2] = useState(modifiedEntity.description ?? {});
        const [usageNote2, setUsageNote2] = useState<LanguageString>(
            isSemanticModelRelationshipUsage(modifiedEntity) ? modifiedEntity.usageNote ?? {} : {}
        );

        const [newIri, setNewIri] = useState(name2[preferredLanguage]?.toLowerCase().replace(WhitespaceRegExp, "-"));
        const [iriHasChanged, setIriHasChanged] = useState(false);

        const [currentRange, currentDomain] =
            isSemanticModelRelationship(modifiedEntity) || isSemanticModelRelationshipUsage(modifiedEntity)
                ? modifiedEntity.ends
                : [null, null];

        const [newRange, setNewRange] = useState(currentRange?.concept);
        const [newDomain, setNewDomain] = useState(currentDomain?.concept);

        const modelIri = getModelIri(model);

        // prepare for modifying entities from non-local models. https://github.com/mff-uk/dataspecer/issues/397
        const { models } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels(models);

        const { relationships: r, /* attributes: a, */ deleteEntityFromModel, profiles: p } = useClassesContext();
        const attributes = r.filter(isAttribute).filter((v) => v.ends.at(0)?.concept == modifiedEntity.id);
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
                            inputType="text"
                            ls={name2}
                            setLs={setName2}
                            defaultLang={preferredLanguage}
                        />
                    </div>
                    <div className="font-semibold">id:</div>
                    <div>{modifiedEntity.id}</div>
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
                    <div className="font-semibold">description:</div>
                    <MultiLanguageInputForLanguageString
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
                    {isSemanticModelClass(modifiedEntity) && (
                        <>
                            <div className="font-semibold">attributes:</div>
                            <div className="flex flex-col">
                                <>
                                    {[...attributes, ...attributeProfiles].map((v) => {
                                        const nameField = isSemanticModelRelationship(v) ? v.ends.at(1)!.name : v.name;

                                        const attr = v.ends.at(1)!;
                                        const name =
                                            getStringFromLanguageStringInLang(nameField ?? {}, preferredLanguage)[0] ??
                                            v.id ??
                                            "no id or iri";
                                        const descr =
                                            getStringFromLanguageStringInLang(
                                                attr.description ?? {},
                                                preferredLanguage
                                            )[0] ?? "";

                                        return (
                                            <div
                                                className={`flex flex-row ${
                                                    toBeRemovedAttributes.includes(v.id) ? "line-through" : ""
                                                }`}
                                                title={descr ?? ""}
                                            >
                                                {name}
                                                {isSemanticModelRelationshipUsage(v) && (
                                                    <div
                                                        className="ml-1 bg-blue-200"
                                                        title={
                                                            getStringFromLanguageStringInLang(
                                                                v.usageNote ?? {},
                                                                preferredLanguage
                                                            )[0] ?? "no usage (profile?) note"
                                                        }
                                                    >
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
                                            getStringFromLanguageStringInLang(attr.name ?? {}, preferredLanguage)[0] ??
                                            v.id ??
                                            "no id or iri";
                                        const descr =
                                            getStringFromLanguageStringInLang(
                                                attr.description ?? {},
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
                    {(isSemanticModelRelationship(modifiedEntity) ||
                        isSemanticModelRelationshipUsage(modifiedEntity)) && (
                        <>
                            <div className="font-semibold">range:</div>
                            <select
                                onChange={(e) => {
                                    setNewRange(e.target.value);
                                }}
                            >
                                <option
                                    disabled={true}
                                    selected={
                                        modifiedEntity.ends.at(0)?.concept == null ||
                                        modifiedEntity.ends.at(0)?.concept == ""
                                    }
                                >
                                    ---
                                </option>
                                {classes.map((c) => (
                                    <option value={c.id} selected={modifiedEntity.ends.at(0)?.concept == c.id}>
                                        {getNameOrIriAndDescription(c, preferredLanguage)[0] +
                                            " ".repeat(3) +
                                            "(" +
                                            (c.iri ?? c.id) +
                                            ")"}
                                    </option>
                                ))}
                            </select>

                            <div className="font-semibold">domain:</div>
                            <div className="flex w-full flex-row">
                                {isAttribute(modifiedEntity) && (
                                    <div className="mr-4">
                                        attribute
                                        <span
                                            className="ml-1"
                                            title="setting a domain makes this attribute more of a relationship"
                                        >
                                            ❓
                                        </span>
                                    </div>
                                )}
                                <select
                                    className="w-full"
                                    onChange={(e) => {
                                        setNewDomain(e.target.value);
                                    }}
                                >
                                    <option
                                        disabled={!isAttribute(modifiedEntity)}
                                        selected={isAttribute(modifiedEntity)}
                                    >
                                        ---
                                    </option>
                                    {classes.map((c) => (
                                        <option value={c.id} selected={modifiedEntity.ends.at(1)?.concept == c.id}>
                                            {getNameOrIriAndDescription(c, preferredLanguage)[0] +
                                                " ".repeat(3) +
                                                "(" +
                                                (c.iri ?? c.id) +
                                                ")"}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}
                </div>
                {isSemanticModelClass(modifiedEntity) && (
                    <p className="bg-slate-100">
                        <div className="flex flex-row justify-between">
                            <button
                                className="bg-slate-300"
                                onClick={() => setWantsToAddNewAttributes((prev) => !prev)}
                            >
                                {wantsToAddNewAttributes ? "cancel" : "add attribute"}
                            </button>
                        </div>
                        <div className="">
                            {wantsToAddNewAttributes && (
                                <AddAttributesComponent
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

                            if (isSemanticModelClass(modifiedEntity)) {
                                result = modifyClassInAModel(model, modifiedEntity.id, {
                                    name: name2,
                                    iri: newIri,
                                    description: description2,
                                });
                                console.log(result);

                                for (const attribute of newAttributes) {
                                    const res = addAttribute(model, attribute);
                                    console.log(res);
                                }

                                for (const attributeProfile of newAttributeProfiles) {
                                    const res = createRelationshipEntityUsage(model, "relationship", attributeProfile);
                                    console.log("wanted to create a new attribute profile", attributeProfile, res);
                                }

                                for (const rem of toBeRemovedAttributes) {
                                    // const res = deleteEntityFromModel(model, rem);
                                    console.log("todo remove entity from attribute's domain", rem);
                                }
                            } else if (isSemanticModelRelationship(modifiedEntity)) {
                                const result = modifyRelationship(model, modifiedEntity.id, {
                                    ...modifiedEntity,
                                    ends: [
                                        {
                                            ...modifiedEntity.ends.at(0)!,
                                            concept: newRange ?? currentRange?.concept ?? "",
                                        },
                                        {
                                            ...modifiedEntity.ends.at(1)!,
                                            concept: newDomain ?? currentDomain?.concept ?? "",
                                        },
                                    ], // if there is a change with `ends`, change it. Otherwise leave it as is
                                    name: name2,
                                    iri: newIri,
                                    description: description2,
                                });
                                console.log(result);
                            } else if (isSemanticModelRelationshipUsage(modifiedEntity)) {
                                // todo

                                const res = updateEntityUsage(model, "relationship-usage", modifiedEntity.id, {
                                    name: name2,
                                    description: description2,
                                    usageNote: usageNote2,
                                    ends: [
                                        {
                                            ...modifiedEntity.ends.at(0)!,
                                            concept: newRange ?? currentRange?.concept ?? "",
                                        },
                                        {
                                            ...modifiedEntity.ends.at(1)!,
                                            concept: newDomain ?? currentDomain?.concept ?? "",
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
                            } else if (isSemanticModelClassUsage(modifiedEntity)) {
                                const res = updateClassUsage(model, "class-usage", modifiedEntity.id, {
                                    name: name2,
                                    description: description2,
                                    usageNote: usageNote2,
                                });
                                console.log(res, "class profile updated", usageNote2, description2, name2);
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
