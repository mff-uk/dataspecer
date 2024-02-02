import { createRdfsModel } from "@dataspecer/core-v2/semantic-model/simplified";
import { httpFetch } from "@dataspecer/core/io/fetch/fetch-browser";
import { useRef, useEffect, useState } from "react";
import { useModelGraphContext } from "../context/graph-context";

export const useAddModelDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const addModelDialogRef = useRef(null as unknown as HTMLDialogElement);
    const { addModelToGraph } = useModelGraphContext();

    useEffect(() => {
        const { current: el } = addModelDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const close = () => {
        setIsOpen(false);
    };
    const open = () => {
        setIsOpen(true);
    };
    const save = (modelTtlFiles: string[]) => {
        const createModel = async () => {
            const model = await createRdfsModel(modelTtlFiles, httpFetch);
            return model;
        };
        createModel().then((m) => addModelToGraph(m));
        close();
    };

    const AddModelDialog = () => {
        const [modelTtlFiles, setModelTtlFiles] = useState([
            "https://schema.org/version/latest/schemaorg-current-https.ttl",
        ]); // FIXME: sanitize

        return (
            <dialog
                ref={addModelDialogRef}
                className="flex h-96 w-96 flex-col justify-between"
                onCancel={
                    (e) => {
                        e.preventDefault();
                        close();
                    } /* TODO: rather close the dialog close() */
                }
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
