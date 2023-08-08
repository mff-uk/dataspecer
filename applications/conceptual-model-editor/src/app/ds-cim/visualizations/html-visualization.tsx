import { PimClass } from "@dataspecer/core/pim/model";
import { LocalChangeType, useLocalChangesContext } from "../hooks/use-local-changes-context";
import { useViewLayoutContext } from "../view-layout";
import { useEffect, useRef, useState } from "react";
import { getLabelOrIri } from "../utils/get-label-or-iri";
import { useCimAdapterContext } from "../hooks/use-cim-adapter-context";

const HtmlClassVis = (props: { cls: PimClass }) => {
    const { cls } = props;
    const { colorOfClass } = useViewLayoutContext();
    const { getAttributesOfClass } = useCimAdapterContext();
    const { changeClass, classHasChanged } = useLocalChangesContext();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleEdit = () => {
        // remove class from adapter?
        // add class to local vocabulary?
        // keep attributes
        setDialogOpen(true);
    };

    const handleConfirm = () => {
        changeClass(cls, LocalChangeType.RENAME);
    };

    const attributesOfClass = getAttributesOfClass(cls);

    return (
        <div className="m-1 bg-white">
            <div className="flex flex-row justify-between">
                <h1 className=" overflow-x-hidden whitespace-nowrap">{getLabelOrIri(cls)}</h1>
                <div className={"h-4 w-4 " + (classHasChanged(cls) ? "bg-red-500" : colorOfClass(cls))} />
            </div>

            <p className="overflow-x-clip">{cls.iri}</p>
            <p>{cls.pimExample}</p>
            <p title="log attributes of class to console" onClick={() => console.log(attributesOfClass)}>
                attrs: {attributesOfClass.length}
            </p>
            <button className="text-slate-500" onClick={handleEdit}>
                edit
            </button>
            {dialogOpen && (
                <EditClassDialog
                    pimClass={cls}
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    handleConfirm={handleConfirm}
                />
            )}
        </div>
    );
};

const EditClassDialog = (props: {
    pimClass: PimClass;
    open: boolean;
    onClose: () => void;
    handleConfirm: () => void;
}) => {
    const editDialogRef = useRef(null as unknown as HTMLDialogElement);
    const { pimClass: cls } = props;

    useEffect(() => {
        const { current: el } = editDialogRef;
        if (props.open && el !== null) el.showModal();
    }, [props.open]);

    return (
        <dialog ref={editDialogRef} className="flex h-96 w-96 flex-col justify-between">
            <div>Modify {getLabelOrIri(cls)}</div>
            <section className="flex flex-row justify-evenly">
                <button
                    onClick={() => {
                        props.handleConfirm();
                        props.onClose();
                    }}
                >
                    edit👍
                </button>
                <button onClick={props.onClose}>close</button>
            </section>
        </dialog>
    );
};

export const HtmlVisualization = () => {
    const { viewLayout } = useViewLayoutContext();

    return (
        <div>
            <h1>HtmlVis</h1>
            <div className="grid grid-cols-3  bg-slate-50">
                {[...viewLayout.elementPositionMap.entries()].map(([cls]) => (
                    <HtmlClassVis cls={cls} key={cls.iri} />
                ))}
            </div>
        </div>
    );
};
