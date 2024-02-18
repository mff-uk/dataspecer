import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { clickedInside } from "../util/utils";
import { useClassesContext } from "../context/classes-context";
import { getDescriptionOfThingInLang, getLanguagesForNamedThing, getNameOfThingInLang } from "../util/language-utils";

export const useEntityDetailDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const editDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [viewedClass, setViewedClass] = useState(null as unknown as SemanticModelClass);

    useEffect(() => {
        const { current: el } = editDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => {
        setIsOpen(false);
        setViewedClass(null as unknown as SemanticModelClass);
    };
    const open = (cls: SemanticModelClass) => {
        setViewedClass(cls);
        setIsOpen(true);
    };
    const save = () => {
        close();
    };

    const EntityDetailDialog = () => {
        const [currentLang, setCurrentLang] = useState("en");

        const langs = getLanguagesForNamedThing(viewedClass);
        const [name, fallbackLang] = getNameOfThingInLang(viewedClass, currentLang);
        const [description, fallbackDescriptionLang] = getDescriptionOfThingInLang(viewedClass, currentLang);

        let displayDescription = "no description";
        if (description && !fallbackDescriptionLang) {
            displayDescription = description;
        } else if (description && fallbackDescriptionLang) {
            displayDescription = `${description}@${fallbackDescriptionLang}`;
        }

        const { attributes: a } = useClassesContext();
        const attributes = a.filter((v) => v.ends.at(0)?.concept == viewedClass.id);

        return (
            <dialog
                ref={editDialogRef}
                className="flex h-96 w-96 flex-col justify-between"
                onCancel={(e) => {
                    e.preventDefault();
                    close();
                }}
                onClick={(e) => {
                    const rect = editDialogRef.current.getBoundingClientRect();
                    const clickedInRect = clickedInside(rect, e.clientX, e.clientY);
                    if (!clickedInRect) {
                        close();
                    }
                }}
            >
                <div>
                    <h5>Detail of: {name + (fallbackLang ? `@${fallbackLang}` : "")}</h5>
                    <div className="grid grid-cols-[80%_20%] grid-rows-1">
                        <p className=" text-gray-500">{viewedClass.iri}</p>
                        <div>
                            <select
                                name="models"
                                id="models"
                                onChange={(e) => setCurrentLang(e.target.value)}
                                defaultValue={currentLang}
                            >
                                {langs.map((lang) => (
                                    <option value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <p>type: {viewedClass.type}</p>
                <p>{displayDescription}</p>
                <p>
                    attributes:
                    {attributes.map((v) => {
                        const attr = v.ends.at(1)!;
                        const [name, fallbackLang] = getNameOfThingInLang(attr, currentLang);
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
                </p>
                <div className="flex flex-row justify-evenly">
                    <button onClick={save}>confirm</button>
                    <button onClick={close}>close</button>
                </div>
            </dialog>
        );
    };

    return {
        isEntityDetailDialogOpen: isOpen,
        closeEntityDetailDialog: close,
        openEntityDetailDialog: open,
        EntityDetailDialog,
    };
};
