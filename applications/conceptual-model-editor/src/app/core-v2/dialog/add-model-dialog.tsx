import { useRef, useEffect, useState } from "react";
import { useBaseDialog } from "./base-dialog";

export const useAddModelDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const addModelDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [onSaveCallback, setOnSaveCallback] = useState<null | ((ttlFiles: string[]) => void)>(null);

    useEffect(() => {
        const { current: el } = addModelDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const localClose = () => {
        setOnSaveCallback(null);
        close();
    };
    const localOpen = (onSaveCallback: (ttlFiles: string[]) => void) => {
        setOnSaveCallback(() => onSaveCallback);
        open();
    };
    const save = async (modelTtlFiles: string[]) => {
        onSaveCallback?.(modelTtlFiles);
        localClose();
    };

    const AddModelDialog = () => {
        const [modelTtlFiles, setModelTtlFiles] = useState([
            "https://www.w3.org/ns/dcat.ttl",
            "https://schema.org/version/latest/schemaorg-current-https.ttl",
        ]); // FIXME: sanitize

        return (
            <BaseDialog heading="Add semantic model">
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
                                modelTtlFiles.filter(() => {
                                    try {
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
            </BaseDialog>
        );
    };

    return {
        isAddModelDialogOpen: isOpen,
        closeAddModelDialog: localClose,
        openAddModelDialog: localOpen,
        AddModelDialog,
    };
};
