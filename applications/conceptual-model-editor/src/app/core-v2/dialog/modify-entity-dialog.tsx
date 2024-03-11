import {
    type SemanticModelClass,
    LanguageString,
    SemanticModelRelationship,
    isSemanticModelRelationship,
    SemanticModelRelationshipEnd,
    isSemanticModelClass,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
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
    isSemanticModelRelationshipUsage,
} from "@dataspecer/core-v2/semantic-model/usage/concepts";
import { createRelationshipUsage } from "@dataspecer/core-v2/semantic-model/usage/operations";

const AddAttributesComponent = (props: {
    modifiedClassId: string;
    saveNewAttribute: (attr: Partial<Omit<SemanticModelRelationship, "type">>) => void;
    saveNewAttributeUsage: (
        attr: Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">
    ) => void;
}) => {
    const [newAttribute, setNewAttribute] = useState<Partial<Omit<SemanticModelRelationship, "type">>>({});
    const [name, setName] = useState({} as LanguageString);
    const [description, setDescription] = useState({} as LanguageString);
    const [cardinality, setCardinality] = useState("");
    const [iri, setIri] = useState("https://fake-attribute-iri.xyz");
    const { attributes } = useClassesContext();
    const [newAttributeIsUsageOf, setNewAttributeIsUsageOf] = useState<string | null>(null);

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
            <div className="grid grid-cols-[min-content_auto] gap-1">
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
                {/* <div>subpropOf:</div>
                <select>
                    <option>---</option>
                    {attributes.map((a) => {
                        const [name, descr] = getNameOrIriAndDescription(a.ends.at(1), a.iri || a.id);
                        return (
                            <option title={descr ?? ""} value={a.id}>
                                {name}
                            </option>
                        );
                    })}
                </select> */}
                <div>is usage of:</div>
                <select
                    onChange={(e) => {
                        setNewAttributeIsUsageOf(e.target.value);
                    }}
                >
                    <option>---</option>
                    {attributes.map((a) => {
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
                        if (newAttributeIsUsageOf) {
                            console.log("usage selected", newAttributeIsUsageOf);
                            props.saveNewAttributeUsage({
                                usageOf: newAttributeIsUsageOf,
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

const AddExistingAttributeComponent = (props: {
    model: InMemorySemanticModel | null;
    toClass: SemanticModelClass | SemanticModelClassUsage;
    a: SemanticModelRelationship[];
    usages: SemanticModelRelationshipUsage[];
}) => {
    const [toBeAddedAttribute, setToBeAddedAttribute] = useState<
        SemanticModelRelationship | SemanticModelRelationshipUsage | null
    >(null);
    const { updateAttribute, updateAttributeUsage } = useClassesContext();
    const possibleAttributes = [...props.a, ...props.usages];
    return (
        <div>
            <select
                onChange={(e) => setToBeAddedAttribute(possibleAttributes.find((a) => a.id == e.target.value) ?? null)}
            >
                {possibleAttributes.map((att) => (
                    <option value={att.id}>
                        {isSemanticModelRelationship(att) ? att.iri : att.id}:
                        {getStringFromLanguageStringInLang(att.ends[1]?.name ?? att.name ?? {})}
                    </option>
                ))}
            </select>
            <button
                onClick={() => {
                    console.log("add existing attr", toBeAddedAttribute);
                    if (!props.model) {
                        console.log("model is null", props);
                        return;
                    }
                    if (toBeAddedAttribute && isSemanticModelRelationship(toBeAddedAttribute)) {
                        const [n, d] = [toBeAddedAttribute.ends[1]!.name, toBeAddedAttribute.ends[1]!.description];

                        updateAttribute(props.model, toBeAddedAttribute.id, {
                            ...toBeAddedAttribute,
                            ends: [
                                { cardinality: [0, null], name: {}, description: {}, concept: props.toClass.id },
                                {
                                    cardinality: [0, null], // TODO: cardinality
                                    n,
                                    d,
                                    // @ts-ignore
                                    concept: null,
                                },
                            ],
                        });
                    } else if (toBeAddedAttribute && isSemanticModelRelationshipUsage(toBeAddedAttribute)) {
                        //todo
                        const [n, d] = [toBeAddedAttribute.ends[1]!.name, toBeAddedAttribute.ends[1]!.description];

                        updateAttribute(props.model, toBeAddedAttribute.id, {
                            ...toBeAddedAttribute,
                            ends: [
                                { cardinality: [0, null], name: {}, description: {}, concept: props.toClass.id },
                                {
                                    cardinality: [0, null], // TODO: cardinality
                                    n,
                                    d,
                                    // @ts-ignore
                                    concept: null,
                                },
                            ],
                        });
                    }
                }}
            >
                add existing attribute
            </button>
        </div>
    );
};

type SupportedTypes = SemanticModelClass | SemanticModelClassUsage | SemanticModelRelationshipUsage;

export const useModifyEntityDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const modifyDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [modifiedEntity, setModifiedEntity] = useState(null as unknown as SupportedTypes);
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);

    const { addAttribute } = useClassesContext();

    useEffect(() => {
        const { current: el } = modifyDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

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
        const [currentName] = getStringFromLanguageStringInLang(modifiedEntity.name ?? {});
        const [newIri, setNewIri] = useState<string | null>(
            isSemanticModelClass(modifiedEntity) ? modifiedEntity.iri : null
        ); // FIXME: sanitize
        const { modifyClassInAModel, createRelationshipEntityUsage, updateEntityUsage } = useModelGraphContext();
        const [name2, setName2] = useState(modifiedEntity.name ?? {});
        const [description2, setDescription2] = useState(modifiedEntity.description ?? {});
        const [usageNote2, setUsageNote2] = useState<LanguageString>(
            isSemanticModelRelationshipUsage(modifiedEntity) ? modifiedEntity.usageNote ?? {} : {}
        );

        // prepare for modifying entities from non-local models. https://github.com/mff-uk/dataspecer/issues/397
        const { models } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels(models);

        const { attributes: a, deleteEntityFromModel, usages } = useClassesContext();
        const attributes = a.filter((v) => v.ends.at(0)?.concept == modifiedEntity.id);

        const [wantsToAddNewAttributes, setWantsToAddNewAttributes] = useState(false);
        const [newAttributes, setNewAttributes] = useState<Partial<Omit<SemanticModelRelationship, "type">>[]>([]);
        const [newAttributeUsages, setNewAttributeUsages] = useState<
            Partial<Omit<SemanticModelRelationshipUsage, "type">> & Pick<SemanticModelRelationshipUsage, "usageOf">[]
        >([]);
        const [toBeRemovedAttributes, setToBeRemovedAttributes] = useState<string[]>([]);

        return (
            <BaseDialog heading="Entity modification">
                <div>
                    <div className="grid grid-cols-[25%_75%]">
                        <div>Detail of:</div>
                        <h5 className=" overflow-x-clip" title={`${currentName} (${modifiedEntity.id})`}>
                            <span className="font-semibold">{currentName}</span> ({modifiedEntity.id})
                        </h5>
                        {isSemanticModelClass(modifiedEntity) && (
                            <>
                                <div className="font-semibold">iri:</div>
                                <input
                                    className="w-[96%]"
                                    value={newIri ?? ""}
                                    onChange={(e) => setNewIri(e.target.value)}
                                />
                            </>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-[25%_75%]">
                    <div className=" font-semibold">new name:</div>
                    <div className="">
                        <MultiLanguageInputForLanguageString
                            inputType="text"
                            ls={name2}
                            setLs={setName2}
                            defaultLang={getAvailableLanguagesForLanguageString(name2)[0] ?? "en"}
                        />
                    </div>

                    <div className="font-semibold">description:</div>
                    <MultiLanguageInputForLanguageString
                        inputType="textarea"
                        ls={description2}
                        setLs={setDescription2}
                        defaultLang={getAvailableLanguagesForLanguageString(description2)[0] ?? "en"}
                    />
                    {isSemanticModelRelationshipUsage(modifiedEntity) && (
                        <>
                            <div className="font-semibold">usage note:</div>
                            <MultiLanguageInputForLanguageString
                                inputType="text"
                                ls={usageNote2}
                                setLs={setUsageNote2}
                                defaultLang={getAvailableLanguagesForLanguageString(usageNote2)?.[0] ?? "en"}
                            />
                        </>
                    )}
                    {isSemanticModelClass(modifiedEntity) && (
                        <>
                            <div className="font-semibold">attributes:</div>
                            <div className="flex flex-col">
                                <>
                                    {[...attributes].map((v) => {
                                        const attr = v.ends.at(1)!;
                                        const [name, descr] = getNameOrIriAndDescription(attr, v.iri ?? v.id);

                                        return (
                                            <div
                                                className={`flex flex-row ${
                                                    toBeRemovedAttributes.includes(v.id) ? "line-through" : ""
                                                }`}
                                                title={descr ?? ""}
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

                                    {[...newAttributes].map((v) => {
                                        const attr = v?.ends?.at(1)!;
                                        const [name, descr] = getNameOrIriAndDescription(
                                            attr,
                                            v.iri ?? v.id ?? "no-iri"
                                        );
                                        return (
                                            <div className="flex flex-row" title={descr ?? ""}>
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

                                    {/* <AddExistingAttributeComponent
                                        a={a}
                                        usages={usages.filter((u): u is SemanticModelRelationshipUsage =>
                                            isSemanticModelRelationshipUsage(u)
                                        )}
                                        model={model}
                                        toClass={modifiedEntity}
                                    /> */}
                                </>
                            </div>
                        </>
                    )}
                </div>
                {isSemanticModelClass(modifiedEntity) && (
                    <p className="bg-slate-100">
                        <div className="flex flex-row justify-between">
                            <button
                                className="bg-indigo-600"
                                onClick={() => setWantsToAddNewAttributes((prev) => !prev)}
                            >
                                {wantsToAddNewAttributes ? "cancel" : "add attribute"}
                            </button>
                        </div>
                        <div>
                            {wantsToAddNewAttributes && (
                                <AddAttributesComponent
                                    modifiedClassId={modifiedEntity.id}
                                    saveNewAttribute={(attribute: Partial<Omit<SemanticModelRelationship, "type">>) => {
                                        setNewAttributes((prev) => prev.concat(attribute));
                                        setWantsToAddNewAttributes(false);
                                    }}
                                    saveNewAttributeUsage={(
                                        attributeUsage: Partial<Omit<SemanticModelRelationshipUsage, "type">> &
                                            Pick<SemanticModelRelationshipUsage, "usageOf">
                                    ) => {
                                        setNewAttributeUsages((prev) => prev.concat(attributeUsage));
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

                                for (const attributeUsage of newAttributeUsages) {
                                    const res = createRelationshipEntityUsage(model, "relationship", attributeUsage);
                                    console.log("wanted to create a new attribute usage", attributeUsage, res);
                                }

                                for (const rem of toBeRemovedAttributes) {
                                    // const res = deleteEntityFromModel(model, rem);
                                    console.log("todo remove entity from attribute's domain", rem);
                                }
                            } else if (isSemanticModelRelationshipUsage(modifiedEntity)) {
                                // todo
                                const res = updateEntityUsage(model, "relationship-usage", modifiedEntity.id, {
                                    name: name2,
                                    description: description2,
                                    usageNote: usageNote2,
                                });
                                console.log(res, "relationship usage updated", usageNote2, description2, name2);
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
