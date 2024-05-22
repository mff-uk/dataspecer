import { useRef, useEffect, useState } from "react";
import { useBaseDialog } from "../components/base-dialog";
import { AddButton } from "../components/dialog/buttons/add-button";
import { CancelButton } from "../components/dialog/buttons/cancel-button";

export const useAddModelDialog = () => {
    const { isOpen, open, close, BaseDialog } = useBaseDialog();
    const addModelDialogRef = useRef(null as unknown as HTMLDialogElement);
    const [onSaveCallback, setOnSaveCallback] = useState<null | ((ttlFiles: string[]) => Promise<void>)>(null);

    useEffect(() => {
        const { current: el } = addModelDialogRef;
        if (isOpen && el !== null) el.showModal();
    }, [isOpen]);

    const localClose = () => {
        setOnSaveCallback(null);
        close();
    };
    const localOpen = (onSaveCallback: (ttlFiles: string[]) => Promise<void>) => {
        setOnSaveCallback(() => onSaveCallback);
        open();
    };
    const save = async (modelTtlFiles: string[]) => {
        await onSaveCallback?.(modelTtlFiles);
        localClose();
    };

    const AddModelDialog = () => {
        const [modelTtlFiles, setModelTtlFiles] = useState([
            "https://www.w3.org/ns/dcat.ttl",
            "https://mff-uk.github.io/demo-vocabularies/original/dublin_core_terms.ttl",
        ]); // FIXME: sanitize

        const handleAddModels = () => {
            save(modelTtlFiles.filter((row) => row.length > 0));
        };

        return (
            <BaseDialog heading="Add semantic model">
                <label>Model .ttl file urls:</label>

                <div className="text-sm italic">
                    Yo yo, be informed that we <strong>did not</strong> optimize for really large models.
                </div>

                <textarea
                    name="ttl-files"
                    rows={4}
                    cols={40}
                    onChange={(e) => setModelTtlFiles(e.target.value.split("\n").map((s) => s.trim()))}
                    value={modelTtlFiles.join("\n")}
                />

                <div className="mt-auto flex flex-row justify-evenly font-semibold">
                    <AddButton onClick={handleAddModels} />
                    <CancelButton onClick={close} />
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
