import {
    SemanticModelRelationshipEnd,
    type SemanticModelClass,
    LanguageString,
    SemanticModelRelationship,
} from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState, Dispatch, SetStateAction } from "react";
import { getNameOf, getDescriptionOf } from "../util/utils";
import { useModelGraphContext } from "../context/graph-context";
import { useClassesContext } from "../context/classes-context";
import { InMemorySemanticModel } from "@dataspecer/core-v2/semantic-model/in-memory";
import { modifyClass } from "@dataspecer/core-v2/semantic-model/operations";

const AddAttributesComponent = (props: {
    modifiedClassId: string;
    setNewAttribute: Dispatch<SetStateAction<Partial<Omit<SemanticModelRelationship, "type">>>>;
}) => {
    const [name, setName] = useState({} as LanguageString);
    const [description, setDescription] = useState({} as LanguageString);
    const [cardinality, setCardinality] = useState("");
    const [iri, setIri] = useState("https://fake-attribute-iri.xyz");

    useEffect(() => {
        props.setNewAttribute({
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
            <p>
                {/* TODO: sanitize */}
                <span className="">name:</span>
                <input value={name.en!} onChange={(e) => setName({ en: e.target.value })} />
            </p>
            <p>
                {/* TODO: sanitize */}
                <span className="">description:</span>
                <input value={description.en!} onChange={(e) => setDescription({ en: e.target.value })} />
            </p>
        </div>
    );
};

export const useModifyEntityDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const modifyDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [modifiedClass, setModifiedClass] = useState(null as unknown as SemanticModelClass);
    const [model, setModel] = useState(null as unknown as InMemorySemanticModel);

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
    const open = (model: InMemorySemanticModel, cls: SemanticModelClass) => {
        setIsOpen(true);
        setModifiedClass(cls);
        setModel(model);
    };

    const ModifyEntityDialog = () => {
        const [newName, setNewName] = useState(getNameOf(modifiedClass).t);
        const [newDescription, setNewDescription] = useState(getDescriptionOf(modifiedClass).t); // FIXME: sanitize
        const [newIri, setNewIri] = useState(modifiedClass.iri ?? ""); // FIXME: sanitize
        const { modifyClassInAModel } = useModelGraphContext();

        const { attributes: a } = useClassesContext();
        const attributes = a.filter((v) => v.ends.at(0)?.concept == modifiedClass.id);

        const [wantsToAddNewAttributes, setWantsToAddNewAttributes] = useState(false);
        const [newAttribute, setNewAttribute] = useState<Partial<Omit<SemanticModelRelationship, "type">>>({});

        return (
            <dialog
                ref={modifyDialogRef}
                className="flex h-96 w-96 flex-col justify-between"
                onCancel={(e) => {
                    e.preventDefault();
                    close();
                }}
            >
                <div>
                    <h4>Entity modification</h4>
                    <h5>
                        Detail of: <input value={newName} onChange={(e) => setNewName(e.target.value)} />@
                        {getNameOf(modifiedClass).l}
                    </h5>
                    <p className="text-gray-500">
                        <input value={newIri} onChange={(e) => setNewIri(e.target.value)} />
                    </p>
                </div>
                <p>type: {modifiedClass.type}</p>
                <p>
                    description: <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                </p>
                <p className="bg-slate-100">
                    <div className="flex flex-row justify-between">
                        <div>attributes:</div>
                        <button className="bg-indigo-600" onClick={() => setWantsToAddNewAttributes((prev) => !prev)}>
                            {wantsToAddNewAttributes ? "cancel" : "customize"}
                        </button>
                    </div>
                    {attributes.map((v) => (
                        <div>
                            {getNameOf(v).t}@{getNameOf(v).l}
                        </div>
                    ))}
                    <div>
                        {wantsToAddNewAttributes && (
                            <AddAttributesComponent
                                modifiedClassId={modifiedClass.id}
                                setNewAttribute={setNewAttribute}
                            />
                        )}
                    </div>
                </p>

                <div className="flex flex-row justify-evenly">
                    <button
                        onClick={() => {
                            console.log(newName, newIri, newDescription);
                            modifyClassInAModel(model, modifiedClass.id, {
                                name: { cs: newName }, // TODO: localization
                                iri: newIri,
                                description: { cs: newDescription }, // TODO: localization
                            });
                            if (wantsToAddNewAttributes) {
                                const res = addAttribute(model, newAttribute);
                                console.log(res);
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
