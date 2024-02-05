import { createRdfsModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { useRef, useEffect, useState } from "react";
import { useModelGraphContext } from "../context/graph-context";
import { clickedInside } from "../util/utils";

export const useBaseDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dialogRef = useRef(null as unknown as HTMLDialogElement);
    const { addModelToGraph } = useModelGraphContext();
    const [onSaveCallback, setOnSaveCallback] = useState<null | (() => void)>();

    useEffect(() => {
        const { current: el } = dialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => {
        setIsOpen(false);
        onSaveCallback?.();
        setOnSaveCallback(null);
    };

    const open = (onSaveCallback: () => void) => {
        setIsOpen(true);
        setOnSaveCallback(() => onSaveCallback);
    };

    const save = async (modelTtlFiles: string[]) => {
        const model = await createRdfsModel(modelTtlFiles, httpFetch);
        model.fetchFromPimStore();
        addModelToGraph(model);
        onSaveCallback?.();
        close();
    };

    const BaseDialog: React.FC<{
        children: React.ReactNode;
        heading: string;
    }> = ({ children, heading }) => {
        const [modelTtlFiles, setModelTtlFiles] = useState([
            "https://schema.org/version/latest/schemaorg-current-https.ttl",
        ]); // FIXME: sanitize

        return (
            <dialog
                ref={dialogRef}
                className="flex h-96 w-96 flex-col justify-between"
                onCancel={(e) => {
                    e.preventDefault();
                    close();
                }}
                onClick={(e) => {
                    const rect = dialogRef.current.getBoundingClientRect();
                    const clickedInRect = clickedInside(rect, e.clientX, e.clientY);
                    if (!clickedInRect) {
                        close();
                    }
                }}
            >
                <div>
                    <h1>{heading}</h1>
                </div>
                {children}

                <div className="flex flex-row justify-evenly">
                    <button
                        onClick={() =>
                            save(
                                modelTtlFiles.filter((u) => {
                                    try {
                                        const a = new URL(u);
                                        return true;
                                    } catch (_) {
                                        return false;
                                    }
                                })
                            )
                        }
                    >
                        confirm
                    </button>
                    <button onClick={close}>close</button>
                </div>
            </dialog>
        );
    };

    return {
        isOpen,
        close,
        open,
        BaseDialog,
    };
};
