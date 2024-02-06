import { SemanticModelClass } from "@dataspecer/core-v2/semantic-model/concepts";
import { useRef, useEffect, useState } from "react";
import { getNameOf, getDescriptionOf, clickedInside } from "../util/utils";
import { useClassesContext } from "../context/classes-context";
import { getNameOfThingInLang } from "../util/language-utils";

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
        const clsName = getNameOf(viewedClass);

        // const [currentLang, setCurrentLang] = useState("en");
        // const clsNameOrFallback = getNameOfThingInLang(viewedClass, currentLang);
        // const clsName = typeof clsNameOrFallback == "string" ? clsNameOrFallback : null;
        // const fallbackName = clsNameOrFallback == null ? null : (clsNameOrFallback as { name: string; lang: string });
        // const fallback = viewedClass.iri ?? viewedClass.id;

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
                    <h5>
                        Detail of: {clsName?.t ?? "unknown name"}
                        {clsName?.l ? "@" + clsName.l : ""}
                        {/* Detail of: {clsName ?? fallback}
                        {clsName ?? fallbackName?.name ?? fallback} */}
                    </h5>
                    <p className=" text-gray-500">{viewedClass.iri}</p>
                </div>
                <p>type: {viewedClass.type}</p>
                <p>
                    {getDescriptionOf(viewedClass).t}@{getDescriptionOf(viewedClass).l}
                </p>
                <p>
                    attributes:
                    {attributes.map((v) => {
                        const attr = v.ends.at(1)!;
                        const name = getNameOf(attr);
                        const description = getDescriptionOf(attr);
                        return (
                            <div title={description?.t}>
                                {name?.t}@{name?.l}
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
