import {
    type SemanticModelClass,
    LanguageString,
    SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState, Dispatch, SetStateAction } from "react";
import { clickedInside } from "../util/utils";
import { useModelGraphContext } from "../context/graph-context";
import { useClassesContext } from "../context/classes-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { EntityModel } from "@dataspecer/core-v2/entity-model";
import {
    getAvailableLanguagesForLanguageString,
    getDescriptionOfThingInLang,
    getNameOfThingInLang,
} from "../util/language-utils";
import { MultiLanguageInputForLanguageString } from "./multi-language-input-4-language-string";

const AddAttributesComponent = (props: {
    modifiedClassId: string;
    saveNewAttribute: (attr: Partial<Omit<SemanticModelRelationship, "type">>) => void;
}) => {
    const [newAttribute, setNewAttribute] = useState<Partial<Omit<SemanticModelRelationship, "type">>>({});
    const [name, setName] = useState({} as LanguageString);
    const [description, setDescription] = useState({} as LanguageString);
    const [cardinality, setCardinality] = useState("");
    const [iri, setIri] = useState("https://fake-attribute-iri.xyz");

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
                <div>subpropOf:</div>
                <select>
                    <option value="bob">bob</option>
                </select>
            </div>
            <div className="flex flex-row justify-center">
                <button
                    onClick={() => {
                        props.saveNewAttribute(newAttribute);
                    }}
                >
                    save
                </button>
            </div>
        </div>
    );
};

export const useModifyEntityDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const modifyDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [modifiedClass, setModifiedClass] = useState(null as unknown as SemanticModelClass);
    const [model, setModel] = useState<InMemorySemanticModel | null>(null);

    const { addAttribute } = useClassesContext();

    useEffect(() => {
        const { current: el } = modifyDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => {
        setIsOpen(false);
        setModifiedClass(null as unknown as SemanticModelClass);
        setModel(null as unknown as InMemorySemanticModel);
    };
    const open = (cls: SemanticModelClass, model: InMemorySemanticModel | null = null) => {
        setIsOpen(true);
        setModifiedClass(cls);
        setModel(model);
    };

    const filterInMemoryModels = (models: Map<string, EntityModel>) => {
        return [...models.entries()].filter(([mId, m]) => m instanceof InMemorySemanticModel).map(([mId, _]) => mId);
    };

    const ModifyEntityDialog = () => {
        const [currentName, fallbackLangOfCurrentName] = getNameOfThingInLang(modifiedClass);
        const [newIri, setNewIri] = useState(modifiedClass.iri ?? ""); // FIXME: sanitize
        const { modifyClassInAModel } = useModelGraphContext();
        const [name2, setName2] = useState(modifiedClass.name);
        const [description2, setDescription2] = useState(modifiedClass.description);

        // prepare for modifying entities from non-local models. https://github.com/mff-uk/dataspecer/issues/397
        const { models } = useModelGraphContext();
        const inMemoryModels = filterInMemoryModels(models);

        const { attributes: a } = useClassesContext();
        const attributes = a.filter((v) => v.ends.at(0)?.concept == modifiedClass.id);

        const [wantsToAddNewAttributes, setWantsToAddNewAttributes] = useState(false);
        const [newAttributes, setNewAttributes] = useState<Partial<Omit<SemanticModelRelationship, "type">>[]>([]);

        return (
            <dialog
                ref={modifyDialogRef}
                className="flex h-[90%] w-[80%] flex-col justify-between bg-slate-50 p-2"
                onCancel={(e) => {
                    e.preventDefault();
                    close();
                }}
                onClick={(e) => {
                    const rect = modifyDialogRef.current.getBoundingClientRect();
                    const clickedInRect = clickedInside(rect, e.clientX, e.clientY);
                    if (!clickedInRect) {
                        close();
                    }
                }}
            >
                <h4 className="mx-2 font-bold">Entity modification</h4>
                <div>
                    <div className="grid grid-cols-[25%_75%]">
                        <div>Detail of:</div>
                        <h5
                            className=" overflow-x-clip"
                            title={`${currentName}@${fallbackLangOfCurrentName} (${modifiedClass.id})`}
                        >
                            <span className="font-semibold">
                                {currentName}@{fallbackLangOfCurrentName}
                            </span>{" "}
                            ({modifiedClass.id})
                        </h5>
                        <div className="font-semibold">iri:</div>
                        <input className="w-[96%]" value={newIri} onChange={(e) => setNewIri(e.target.value)} />
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
                    <div className="font-semibold">attributes:</div>
                    {[...attributes, ...newAttributes].map((v) => {
                        const attr = v?.ends?.at(1)!;
                        const [name, fallbackLang] = getNameOfThingInLang(attr);
                        const [attributeDescription, fallbackAttributeDescriptionLang] =
                            getDescriptionOfThingInLang(attr);

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
                <p className="bg-slate-100">
                    <div className="flex flex-row justify-between">
                        <button className="bg-indigo-600" onClick={() => setWantsToAddNewAttributes((prev) => !prev)}>
                            {wantsToAddNewAttributes ? "cancel" : "add attribute"}
                        </button>
                    </div>
                    <div>
                        {wantsToAddNewAttributes && (
                            <AddAttributesComponent
                                modifiedClassId={modifiedClass.id}
                                saveNewAttribute={(attribute: Partial<Omit<SemanticModelRelationship, "type">>) => {
                                    setNewAttributes((prev) => prev.concat(attribute));
                                    setWantsToAddNewAttributes(false);
                                }}
                            />
                        )}
                    </div>
                </p>

                <div className="flex flex-row justify-evenly">
                    <button
                        disabled={wantsToAddNewAttributes}
                        className=" hover:disabled:cursor-not-allowed"
                        title={wantsToAddNewAttributes ? "first save the attribute or cancel the action" : ""}
                        onClick={() => {
                            console.log(name2, newIri, description2);
                            if (!model) {
                                alert(`model is null`);
                                close();
                                return;
                            }
                            const result = modifyClassInAModel(model, modifiedClass.id, {
                                name: name2,
                                iri: newIri,
                                description: description2,
                            });

                            // console.log(result);

                            if (wantsToAddNewAttributes) {
                                for (const attribute of newAttributes) {
                                    const res = addAttribute(model, attribute);
                                    console.log(res);
                                }
                            }
                            close();
                        }}
                    >
                        save
                    </button>
                    <button onClick={close}>close</button>
                </div>
            </dialog>
        );
    };

    return {
        isModifyEntityDialogOpen: isOpen,
        closeModifyEntityDialog: close,
        openModifyEntityDialog: open,
        ModifyEntityDialog,
    };
};
