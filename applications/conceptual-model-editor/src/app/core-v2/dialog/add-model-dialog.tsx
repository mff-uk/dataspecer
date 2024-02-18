import { createRdfsModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { useRef, useEffect, useState } from "react";
import { useModelGraphContext } from "../context/graph-context";
import { clickedInside } from "../util/utils";
import { useBaseDialog } from "./base-dialog";

export const useAddModelDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const addModelDialogRef = useRef(null as unknown as HTMLDialogElement);
    const { addModelToGraph } = useModelGraphContext();
    const [onSaveCallback, setOnSaveCallback] = useState<null | (() => void)>();

    useEffect(() => {
        const { current: el } = addModelDialogRef;
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

    const AddModelDialog = () => {
        const [modelTtlFiles, setModelTtlFiles] = useState([
            "https://www.w3.org/ns/dcat.ttl",
            "https://schema.org/version/latest/schemaorg-current-https.ttl",
        ]); // FIXME: sanitize

        return (
            <dialog
                ref={addModelDialogRef}
                className="flex h-96 w-96 flex-col justify-between"
                onCancel={(e) => {
                    e.preventDefault();
                    close();
                }}
                onClick={(e) => {
                    const rect = addModelDialogRef.current.getBoundingClientRect();
                    const clickedInRect = clickedInside(rect, e.clientX, e.clientY);
                    if (!clickedInRect) {
                        close();
                    }
                }}
            >
                <div>
                    <h5>Add Semantic Model</h5>
                </div>
                <label>Model .ttl file urls:</label>
                <textarea
                    name="ttl-files"
                    rows={4}
                    cols={40}
                    onChange={(e) => setModelTtlFiles(e.target.value.split("\n").map((s) => s.trim()))}
                    value={modelTtlFiles.join("\n")}
                />

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
        isAddModelDialogOpen: isOpen,
        closeAddModelDialog: close,
        openAddModelDialog: open,
        AddModelDialog,
    };
};

export const useAddModelDialog2 = () => {
    const { open, isOpen, close, BaseDialog } = useBaseDialog();

    const AddModelDialog2 = () => {
        const [modelTtlFiles, setModelTtlFiles] = useState([
            "https://schema.org/version/latest/schemaorg-current-https.ttl",
        ]); // FIXME: sanitize

        return (
            <BaseDialog heading="Add Semantic Model">
                <>
                    <label>Model .ttl file urls:</label>
                    <textarea
                        name="ttl-files"
                        rows={4}
                        cols={40}
                        onChange={(e) => setModelTtlFiles(e.target.value.split("\n").map((s) => s.trim()))}
                        value={modelTtlFiles.join("\n")}
                    />
                </>
            </BaseDialog>
        );
    };

    return {
        isAddModelDialogOpen: isOpen,
        closeAddModelDialog: close,
        openAddModelDialog: open,
        AddModelDialog2,
    };
};
